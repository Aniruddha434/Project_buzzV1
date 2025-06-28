import nodemailer from 'nodemailer';
import handlebars from 'handlebars';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = new Map();
    this.initialized = false;
    this.initializeTransporter();
    this.loadTemplates();
    this.initialized = true;
  }

  // Method to reinitialize if environment variables are loaded later
  reinitialize() {
    console.log('🔄 Reinitializing email service...');
    this.initializeTransporter();
    this.initialized = true;
  }

  initializeTransporter() {
    console.log('🔧 Initializing email service...');

    // Configure email transporter based on environment
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    };

    console.log(`📧 SMTP Config: ${emailConfig.host}:${emailConfig.port} for ${emailConfig.auth.user}`);

    // For development, use ethereal email if no SMTP config
    if (!process.env.SMTP_USER) {
      console.log('⚠️  No SMTP configuration found. Email notifications will be logged to console.');
      this.transporter = null;
      return;
    }

    try {
      console.log('🔧 Creating nodemailer transporter...');

      // Use correct method name 'createTransport' (not 'createTransporter')
      let createTransport;

      if (nodemailer.default && typeof nodemailer.default.createTransport === 'function') {
        // ES6 module with default export
        createTransport = nodemailer.default.createTransport.bind(nodemailer.default);
        console.log('✅ Using nodemailer.default.createTransport');
      } else if (typeof nodemailer.createTransport === 'function') {
        // Direct import
        createTransport = nodemailer.createTransport.bind(nodemailer);
        console.log('✅ Using nodemailer.createTransport');
      } else {
        throw new Error('createTransport method not found on nodemailer. Available methods: ' + Object.keys(nodemailer));
      }

      this.transporter = createTransport(emailConfig);
      console.log('✅ Email service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
      this.transporter = null;
    }
  }

  loadTemplates() {
    console.log('📂 Loading email templates...');

    // Load email templates
    const templatesDir = path.join(__dirname, '../templates/email');
    console.log(`📁 Templates directory: ${templatesDir}`);

    // Create templates directory if it doesn't exist
    if (!fs.existsSync(templatesDir)) {
      console.log('📁 Creating templates directory...');
      fs.mkdirSync(templatesDir, { recursive: true });
    }

    const templateFiles = [
      'purchase-confirmation.hbs',
      'sale-notification.hbs',
      'payment-success.hbs',
      'payment-failed.hbs',
      'admin-alert.hbs',
      'new-user-registration.hbs',
      'generic-notification.hbs',
      'test-email.hbs'
    ];

    let loadedCount = 0;
    templateFiles.forEach(filename => {
      const templatePath = path.join(templatesDir, filename);
      if (fs.existsSync(templatePath)) {
        try {
          const templateContent = fs.readFileSync(templatePath, 'utf8');
          const templateName = filename.replace('.hbs', '');
          this.templates.set(templateName, handlebars.compile(templateContent));
          loadedCount++;
          console.log(`✅ Loaded template: ${templateName}`);
        } catch (error) {
          console.error(`❌ Failed to load template ${filename}:`, error.message);
        }
      } else {
        console.log(`⚠️  Template not found: ${filename}`);
      }
    });

    console.log(`📧 Successfully loaded ${loadedCount}/${templateFiles.length} email templates`);
  }

  async sendEmail(options) {
    const {
      to,
      subject,
      template,
      data = {},
      attachments = []
    } = options;

    try {
      // Check if we need to reinitialize (in case env vars were loaded after construction)
      if (!this.transporter && process.env.SMTP_USER) {
        console.log('🔄 Environment variables detected, reinitializing email service...');
        this.reinitialize();
      }

      // If no transporter, log to console (development mode)
      if (!this.transporter) {
        console.log('\n📧 EMAIL NOTIFICATION (Development Mode):');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Template: ${template}`);
        console.log(`Data:`, data);
        console.log('─'.repeat(50));
        return { success: true, messageId: 'dev-mode-' + Date.now() };
      }

      // Get template or use fallback
      let html;
      const templateFunction = this.templates.get(template);
      if (templateFunction) {
        // Compile template with data
        html = templateFunction({
          ...data,
          appName: process.env.APP_NAME || 'ProjectBuzz',
          appUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
          supportEmail: process.env.SUPPORT_EMAIL || 'support@projectbuzz.com',
          currentYear: new Date().getFullYear()
        });
      } else {
        // Fallback HTML if template not available
        html = `
          <h1>${subject}</h1>
          <p>Hello,</p>
          <p>This is a notification from ${process.env.APP_NAME || 'ProjectBuzz'}.</p>
          <p>Template: ${template}</p>
          <p>Data: ${JSON.stringify(data, null, 2)}</p>
          <p>Best regards,<br>${process.env.APP_NAME || 'ProjectBuzz'} Team</p>
        `;
      }

      // Email options
      const mailOptions = {
        from: {
          name: process.env.FROM_NAME || 'ProjectBuzz',
          address: process.env.FROM_EMAIL || process.env.SMTP_USER
        },
        to,
        subject,
        html,
        attachments
      };

      // Send email
      const result = await this.transporter.sendMail(mailOptions);

      console.log(`✅ Email sent successfully to ${to}: ${result.messageId}`);
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };

    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Specific email methods for different notification types
  async sendPurchaseConfirmation(user, project, payment) {
    return this.sendEmail({
      to: user.email,
      subject: `Purchase Confirmation - ${project.title}`,
      template: 'purchase-confirmation',
      data: {
        userName: user.displayName || user.email.split('@')[0],
        projectTitle: project.title,
        projectPrice: payment.amount,
        orderId: payment.orderId,
        transactionId: payment.razorpayPaymentId || payment.paymentDetails?.razorpayPaymentId,
        downloadUrl: `${process.env.FRONTEND_URL}/dashboard/purchases`,
        orderDate: new Date().toLocaleDateString()
      }
    });
  }

  async sendSaleNotification(seller, buyer, project, payment) {
    return this.sendEmail({
      to: seller.email,
      subject: `New Sale - ${project.title}`,
      template: 'sale-notification',
      data: {
        sellerName: seller.displayName || seller.email.split('@')[0],
        buyerName: buyer.displayName || buyer.email.split('@')[0],
        projectTitle: project.title,
        saleAmount: payment.amount,
        orderId: payment.orderId,
        dashboardUrl: `${process.env.FRONTEND_URL}/dashboard`,
        saleDate: new Date().toLocaleDateString()
      }
    });
  }

  async sendPaymentSuccess(user, payment, project) {
    return this.sendEmail({
      to: user.email,
      subject: `Payment Successful - Order #${payment.orderId}`,
      template: 'payment-success',
      data: {
        userName: user.displayName || user.email.split('@')[0],
        orderId: payment.orderId,
        amount: payment.amount,
        projectTitle: project.title,
        paymentMethod: payment.paymentDetails?.paymentMethod || payment.paymentDetails?.method || 'Online',
        transactionId: payment.razorpayPaymentId || payment.paymentDetails?.razorpayPaymentId || payment.paymentDetails?.cfPaymentId,
        downloadUrl: `${process.env.FRONTEND_URL}/dashboard/purchases`
      }
    });
  }

  async sendPaymentFailed(user, payment, project) {
    return this.sendEmail({
      to: user.email,
      subject: `Payment Failed - Order #${payment.orderId}`,
      template: 'payment-failed',
      data: {
        userName: user.displayName || user.email.split('@')[0],
        orderId: payment.orderId,
        amount: payment.amount,
        projectTitle: project.title,
        retryUrl: `${process.env.FRONTEND_URL}/project/${project._id}`,
        supportEmail: process.env.SUPPORT_EMAIL || 'support@projectbuzz.com'
      }
    });
  }

  async sendAdminAlert(admin, alertType, data) {
    return this.sendEmail({
      to: admin.email,
      subject: `Admin Alert - ${alertType}`,
      template: 'admin-alert',
      data: {
        adminName: admin.displayName || admin.email.split('@')[0],
        alertType,
        alertData: data,
        dashboardUrl: `${process.env.FRONTEND_URL}/admin`,
        timestamp: new Date().toLocaleString()
      }
    });
  }

  async sendNewUserRegistration(admin, newUser) {
    // Import User model to get statistics
    const User = (await import('../models/User.js')).default;
    const Project = (await import('../models/Project.js')).default;
    const Payment = (await import('../models/Payment.js')).default;

    // Get platform statistics for the email
    let platformStats = {
      totalUsers: 0,
      newUsersToday: 0,
      activeProjects: 0,
      totalSales: 0
    };

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [totalUsers, newUsersToday, activeProjects, totalSales] = await Promise.all([
        User.countDocuments({}),
        User.countDocuments({ createdAt: { $gte: today } }),
        Project.countDocuments({ status: 'approved' }),
        Payment.countDocuments({ status: 'PAID' })
      ]);

      platformStats = {
        totalUsers,
        newUsersToday,
        activeProjects,
        totalSales
      };
    } catch (statsError) {
      console.warn('⚠️  Could not fetch platform statistics for email:', statsError.message);
    }

    return this.sendEmail({
      to: admin.email,
      subject: `New User Registration - ${newUser.email}`,
      template: 'new-user-registration',
      data: {
        adminName: admin.displayName || admin.email.split('@')[0],
        newUserEmail: newUser.email,
        newUserName: newUser.displayName || 'Not provided',
        newUserRole: newUser.role,
        registrationDate: new Date().toLocaleDateString(),
        registrationTime: new Date().toLocaleTimeString(),
        userManagementUrl: `${process.env.FRONTEND_URL}/admin/users`,
        ...platformStats
      }
    });
  }

  // Test email functionality
  async sendTestEmail(to) {
    return this.sendEmail({
      to,
      subject: 'ProjectBuzz - Email Service Test',
      template: 'test-email',
      data: {
        testMessage: 'Email service is working correctly!',
        timestamp: new Date().toLocaleString()
      }
    });
  }

  // Verify email configuration
  async verifyConnection() {
    // Check if we need to reinitialize (in case env vars were loaded after construction)
    if (!this.transporter && !this.initialized && process.env.SMTP_USER) {
      console.log('🔄 Environment variables detected, reinitializing email service...');
      this.reinitialize();
    }

    if (!this.transporter) {
      return { success: false, error: 'No email transporter configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connection verified' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;

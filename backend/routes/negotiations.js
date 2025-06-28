import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import Negotiation from '../models/Negotiation.js';
import DiscountCode from '../models/DiscountCode.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { body, validationResult, param } from 'express-validator';

const router = express.Router();

// Predefined message templates
const MESSAGE_TEMPLATES = {
  interested: "I'm interested in this project. Can we discuss the details?",
  lower_price: "Would you consider a lower price for this project?",
  best_offer: "What's your best offer for this project?",
  custom_request: "I have some specific requirements. Can we discuss customizations?",
  timeline_question: "What's the expected timeline for this project?",
  feature_question: "Can you provide more details about the features included?"
};

// Start negotiation
router.post('/start', [
  verifyToken,
  body('projectId').isMongoId().withMessage('Valid project ID required'),
  body('message').optional().isLength({ max: 500 }).withMessage('Message too long'),
  body('templateId').optional().isIn(Object.keys(MESSAGE_TEMPLATES)).withMessage('Invalid template')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { projectId, message, templateId } = req.body;
    const buyerId = req.user._id;

    // Get project details
    const project = await Project.findById(projectId).populate('seller');
    console.log('Project found:', project ? 'Yes' : 'No');
    console.log('Project seller:', project?.seller);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if project has a seller
    if (!project.seller) {
      console.log('Project has no seller assigned');
      return res.status(400).json({ error: 'This project does not have a seller assigned and cannot be negotiated' });
    }

    // Check if buyer is trying to negotiate their own project
    const sellerId = project.seller._id ? project.seller._id.toString() : project.seller.toString();
    if (sellerId === buyerId.toString()) {
      return res.status(400).json({ error: 'Cannot negotiate on your own project' });
    }

    // Check if negotiation already exists
    const existingNegotiation = await Negotiation.findOne({
      project: projectId,
      buyer: buyerId,
      status: { $in: ['active', 'accepted'] }
    });

    if (existingNegotiation) {
      return res.status(400).json({ error: 'Negotiation already exists for this project' });
    }

    // Create new negotiation
    const negotiation = new Negotiation({
      project: projectId,
      buyer: buyerId,
      seller: project.seller._id ? project.seller._id : project.seller,
      originalPrice: project.price,
      currentOffer: project.price,
      minimumPrice: Math.floor(project.price * 0.7) // 30% discount maximum
    });

    // Add initial message
    const messageContent = templateId ? MESSAGE_TEMPLATES[templateId] : message;
    if (!messageContent) {
      return res.status(400).json({ error: 'Message or template required' });
    }

    negotiation.addMessage({
      type: 'template',
      content: messageContent,
      templateId,
      sender: buyerId
    });

    await negotiation.save();

    // Populate for response
    await negotiation.populate([
      { path: 'project', select: 'title price images' },
      { path: 'buyer', select: 'username email' },
      { path: 'seller', select: 'username email' }
    ]);

    res.status(201).json({
      success: true,
      negotiation
    });

  } catch (error) {
    console.error('Start negotiation error:', error);
    res.status(500).json({ error: 'Failed to start negotiation' });
  }
});

// Send message
router.post('/:id/message', [
  verifyToken,
  param('id').isMongoId().withMessage('Valid negotiation ID required'),
  body('type').isIn(['template', 'price_offer', 'counter_offer']).withMessage('Invalid message type'),
  body('content').optional().isLength({ max: 500 }).withMessage('Message too long'),
  body('templateId').optional().isIn(Object.keys(MESSAGE_TEMPLATES)),
  body('priceOffer').optional().isNumeric().isFloat({ min: 1 }).withMessage('Valid price required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { type, content, templateId, priceOffer } = req.body;
    const userId = req.user._id;

    const negotiation = await Negotiation.findById(id);
    if (!negotiation) {
      return res.status(404).json({ error: 'Negotiation not found' });
    }

    // Check if user is part of negotiation
    if (negotiation.buyer.toString() !== userId.toString() && negotiation.seller.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if negotiation is active
    if (negotiation.status !== 'active') {
      return res.status(400).json({ error: 'Negotiation is not active' });
    }

    // Check rate limit
    if (!negotiation.checkRateLimit(userId.toString())) {
      return res.status(429).json({ error: 'Rate limit exceeded. Please wait before sending another message.' });
    }

    // Validate price offer
    if ((type === 'price_offer' || type === 'counter_offer') && priceOffer) {
      if (priceOffer < negotiation.minimumPrice) {
        return res.status(400).json({
          error: `Price cannot be below minimum of ₹${negotiation.minimumPrice}`
        });
      }
    }

    // Prepare message content
    let messageContent = content;
    if (templateId && MESSAGE_TEMPLATES[templateId]) {
      messageContent = MESSAGE_TEMPLATES[templateId];
    }

    // Add message
    const message = negotiation.addMessage({
      type,
      content: messageContent,
      templateId,
      priceOffer,
      sender: userId
    });

    await negotiation.save();

    res.json({
      success: true,
      message,
      negotiation: {
        id: negotiation._id,
        currentOffer: negotiation.currentOffer,
        status: negotiation.status
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Accept offer
router.post('/:id/accept', [
  verifyToken,
  param('id').isMongoId().withMessage('Valid negotiation ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const negotiation = await Negotiation.findById(id).populate('project');
    if (!negotiation) {
      return res.status(404).json({ error: 'Negotiation not found' });
    }

    // Only seller can accept offers
    if (negotiation.seller.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only seller can accept offers' });
    }

    if (negotiation.status !== 'active') {
      return res.status(400).json({ error: 'Negotiation is not active' });
    }

    if (!negotiation.currentOffer) {
      return res.status(400).json({ error: 'No offer to accept' });
    }

    // Generate discount code
    const code = await DiscountCode.generateUniqueCode();

    // Calculate discount details
    const originalPrice = negotiation.originalPrice;
    const discountedPrice = negotiation.currentOffer;
    const discountAmount = originalPrice - discountedPrice;
    const discountPercentage = Math.round((discountAmount / originalPrice) * 100);

    const discountCode = new DiscountCode({
      code,
      negotiation: negotiation._id,
      project: negotiation.project._id,
      buyer: negotiation.buyer,
      seller: negotiation.seller,
      originalPrice,
      discountedPrice,
      discountAmount,
      discountPercentage,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
      metadata: {
        generatedBy: userId,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    await discountCode.save();

    // Update negotiation
    negotiation.status = 'accepted';
    negotiation.finalPrice = negotiation.currentOffer;
    negotiation.discountCode = {
      code,
      expiresAt: discountCode.expiresAt,
      isUsed: false
    };

    // Add system message
    negotiation.addMessage({
      type: 'system',
      content: `Offer accepted! Discount code generated: ${code}. Valid for 48 hours.`,
      sender: userId
    });

    await negotiation.save();

    res.json({
      success: true,
      discountCode: code,
      finalPrice: negotiation.finalPrice,
      expiresAt: discountCode.expiresAt,
      message: 'Offer accepted successfully! Discount code has been generated.'
    });

  } catch (error) {
    console.error('Accept offer error:', error);
    res.status(500).json({ error: 'Failed to accept offer' });
  }
});

// Reject offer
router.post('/:id/reject', [
  verifyToken,
  param('id').isMongoId().withMessage('Valid negotiation ID required'),
  body('reason').optional().isLength({ max: 200 }).withMessage('Reason too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const negotiation = await Negotiation.findById(id);
    if (!negotiation) {
      return res.status(404).json({ error: 'Negotiation not found' });
    }

    // Only seller can reject offers
    if (negotiation.seller.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Only seller can reject offers' });
    }

    if (negotiation.status !== 'active') {
      return res.status(400).json({ error: 'Negotiation is not active' });
    }

    // Update negotiation
    negotiation.status = 'rejected';

    // Add system message
    const rejectMessage = reason ?
      `Offer rejected. Reason: ${reason}` :
      'Offer rejected by seller.';

    negotiation.addMessage({
      type: 'system',
      content: rejectMessage,
      sender: userId
    });

    await negotiation.save();

    res.json({
      success: true,
      message: 'Offer rejected successfully'
    });

  } catch (error) {
    console.error('Reject offer error:', error);
    res.status(500).json({ error: 'Failed to reject offer' });
  }
});

// Get user's negotiations
router.get('/my', verifyToken, async (req, res) => {
  try {
    const userId = req.user._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = {
      $or: [
        { buyer: userId },
        { seller: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const negotiations = await Negotiation.find(query)
      .populate('project', 'title price images')
      .populate('buyer', 'username')
      .populate('seller', 'username')
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Negotiation.countDocuments(query);

    res.json({
      success: true,
      negotiations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get negotiations error:', error);
    res.status(500).json({ error: 'Failed to fetch negotiations' });
  }
});

// Get specific negotiation
router.get('/:id', [
  verifyToken,
  param('id').isMongoId().withMessage('Valid negotiation ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const userId = req.user._id;

    const negotiation = await Negotiation.findById(id)
      .populate('project', 'title price images description')
      .populate('buyer', 'username email')
      .populate('seller', 'username email')
      .populate('messages.sender', 'username');

    if (!negotiation) {
      return res.status(404).json({ error: 'Negotiation not found' });
    }

    // Check if user is part of negotiation
    if (negotiation.buyer._id.toString() !== userId.toString() && negotiation.seller._id.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      negotiation
    });

  } catch (error) {
    console.error('Get negotiation error:', error);
    res.status(500).json({ error: 'Failed to fetch negotiation' });
  }
});

// Validate discount code
router.post('/validate-code', [
  verifyToken,
  body('code').notEmpty().withMessage('Discount code required'),
  body('projectId').isMongoId().withMessage('Valid project ID required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, projectId } = req.body;
    const buyerId = req.user._id;

    const validation = await DiscountCode.validateForPurchase(code, buyerId, projectId);

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    res.json({
      success: true,
      valid: true,
      discountAmount: validation.discountAmount,
      finalPrice: validation.finalPrice,
      originalPrice: validation.discountCode.originalPrice,
      expiresAt: validation.discountCode.expiresAt
    });

  } catch (error) {
    console.error('Validate code error:', error);
    res.status(500).json({ error: 'Failed to validate discount code' });
  }
});

// Report negotiation
router.post('/:id/report', [
  verifyToken,
  param('id').isMongoId().withMessage('Valid negotiation ID required'),
  body('reason').notEmpty().isLength({ max: 500 }).withMessage('Valid reason required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;

    const negotiation = await Negotiation.findById(id);
    if (!negotiation) {
      return res.status(404).json({ error: 'Negotiation not found' });
    }

    // Check if user is part of negotiation
    if (negotiation.buyer.toString() !== userId.toString() && negotiation.seller.toString() !== userId.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if already reported by this user
    const alreadyReported = negotiation.reportedBy.some(
      report => report.user.toString() === userId.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({ error: 'Already reported by you' });
    }

    negotiation.reportedBy.push({
      user: userId,
      reason
    });

    await negotiation.save();

    res.json({
      success: true,
      message: 'Negotiation reported successfully'
    });

  } catch (error) {
    console.error('Report negotiation error:', error);
    res.status(500).json({ error: 'Failed to report negotiation' });
  }
});

// Get message templates
router.get('/templates/list', (req, res) => {
  res.json({
    success: true,
    templates: Object.entries(MESSAGE_TEMPLATES).map(([id, content]) => ({
      id,
      content
    }))
  });
});

export default router;

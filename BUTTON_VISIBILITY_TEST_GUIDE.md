# ProjectBuzz Button Visibility Test Guide

## Test Environment
- Frontend: http://localhost:5175
- Backend: http://localhost:5000
- Status: ✅ Both servers running successfully

## Test Cases

### 1. Home Page Button Visibility Test
**URL**: http://localhost:5175/

**Expected Results**:
- Featured Projects section should display 4 project cards
- Each project card should show:
  - Project image (75% of card height)
  - Project title and category (in content area)
  - Action buttons (25% of card height):
    - **Buy Now button**: Black background, white text, shopping cart icon, price displayed
    - **Negotiate button**: Gray background, "Negotiate" text, message icon

**Test Steps**:
1. Open home page
2. Scroll to "Featured Projects" section
3. Verify all project cards display buttons
4. Check button styling matches requirements
5. Test button hover effects
6. Verify buttons are clickable (check console for click logs)

### 2. Market Page Button Visibility Test
**URL**: http://localhost:5175/market

**Expected Results**:
- Grid of all approved projects
- Same button requirements as home page
- Responsive design: buttons stack vertically on mobile

**Test Steps**:
1. Open market page
2. Verify all project cards show buttons
3. Test search and filter functionality
4. Ensure buttons remain visible after filtering
5. Test responsive design (resize browser window)

### 3. User Role-Based Button Testing

#### Guest User (Not Logged In)
**Expected Buttons**:
- **Primary Button**: "Sign in to Buy" (black, shopping cart icon)
- **Secondary Button**: "Save" (gray, heart icon)

#### Buyer User (Logged In)
**Expected Buttons**:
- **Buy Now Button**: "Buy ₹[price]" (black, shopping cart icon)
- **Negotiate Button**: "Negotiate" (gray, message icon)

#### Purchased Projects
**Expected Display**:
- **Owned Badge**: "Owned" with checkmark icon (gray background)

### 4. Mobile Responsive Testing

**Viewport Sizes to Test**:
- Mobile: 320px - 640px
- Tablet: 640px - 1024px
- Desktop: 1024px+

**Expected Mobile Behavior**:
- Buttons stack vertically
- Minimum 44px touch target height
- Adequate spacing between buttons
- No horizontal scrolling

### 5. Button Functionality Testing

#### Buy Now Button
1. Click should open project details modal
2. Modal should show project information
3. Payment flow should be accessible
4. Console should log: "Buy button clicked for project: [title]"

#### Negotiate Button
1. Click should open negotiation modal
2. Modal should show message templates
3. Price offer functionality should work
4. Console should log: "Negotiation started for project: [title]"

#### Save Button (Guest Users)
1. Click should open share modal
2. Console should log: "Save button clicked for project: [title]"

## Visual Verification Checklist

### Card Layout
- [ ] Project image takes 75% of card height
- [ ] Content area takes 25% of card height
- [ ] Card height: 320px (desktop), 300px (mobile)
- [ ] No content overflow or clipping

### Button Styling
- [ ] Buy Now: Black background (#000000), white text
- [ ] Negotiate: Gray background (#374151), light gray text (#d1d5db)
- [ ] Save: Gray background, heart icon
- [ ] All buttons have proper border radius and padding
- [ ] Icons are properly sized and positioned

### Responsive Design
- [ ] Desktop: Buttons side by side (if space allows)
- [ ] Mobile: Buttons stacked vertically
- [ ] Touch targets meet 44px minimum on mobile
- [ ] Proper spacing between elements

## Debugging Tools

### Browser Console
- Check for JavaScript errors
- Look for button click logs
- Verify API calls are successful

### Developer Tools
- Inspect element to verify CSS classes
- Check computed styles for button dimensions
- Test different viewport sizes

### Network Tab
- Verify project data is loading
- Check API response structure
- Ensure images are loading properly

## Common Issues to Check

1. **Buttons Not Visible**: Check card height and content area proportions
2. **Buttons Cut Off**: Verify min-height and flex-shrink properties
3. **Poor Mobile Experience**: Test touch targets and stacking
4. **Styling Issues**: Verify CSS classes are applied correctly
5. **Functionality Broken**: Check console for JavaScript errors

## Success Criteria

✅ **All buttons are clearly visible on both pages**
✅ **Buttons maintain proper styling and proportions**
✅ **Mobile responsive design works correctly**
✅ **Button click handlers function properly**
✅ **User role-based button display works**
✅ **No console errors or layout issues**

## Next Steps After Testing

1. If tests pass: Remove any remaining debug code
2. If issues found: Document specific problems and fix
3. Test with real project data from database
4. Verify with different user accounts
5. Test payment and negotiation flows end-to-end

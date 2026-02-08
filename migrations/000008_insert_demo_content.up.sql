-- +migrate Up
-- Insert demo banners for IAB standard formats
INSERT INTO demo_banners (id, name, format, html, width, height, click_url, active, created_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'Leaderboard Demo', 'leaderboard',
'<div style="width:728px;height:90px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;color:white;font-family:Arial;font-size:24px;font-weight:bold;text-align:center;">
  <div style="display:flex;align-items:center;gap:20px;">
    <div>🚀 AdServer Demo</div>
    <div style="font-size:14px;font-weight:normal;">Monetize Your Traffic Today</div>
    <button style="background:white;color:#667eea;border:none;padding:8px 16px;border-radius:4px;cursor:pointer;font-weight:bold;">Get Started</button>
  </div>
</div>',
728, 90, 'https://example.com/demo-click', true, NOW()),

('550e8400-e29b-41d4-a716-446655440002', 'Medium Rectangle Demo', 'medium-rectangle',
'<div style="width:300px;height:250px;background:linear-gradient(180deg,#f093fb 0%,#f5576c 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:Arial;text-align:center;padding:20px;box-sizing:border-box;">
  <div style="font-size:32px;">💰</div>
  <div style="font-size:18px;font-weight:bold;margin:10px 0;">Start Earning</div>
  <div style="font-size:12px;opacity:0.9;">Join 1000+ publishers</div>
  <button style="background:white;color:#f5576c;border:none;padding:10px 20px;border-radius:20px;margin-top:15px;cursor:pointer;font-weight:bold;">Sign Up Free</button>
</div>',
300, 250, 'https://example.com/demo-click', true, NOW()),

('550e8400-e29b-41d4-a716-446655440003', 'Skyscraper Demo', 'skyscraper',
'<div style="width:160px;height:600px;background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:Arial;text-align:center;padding:20px;box-sizing:border-box;">
  <div style="font-size:28px;">📈</div>
  <div style="font-size:16px;font-weight:bold;margin:10px 0;">Boost Revenue</div>
  <div style="font-size:11px;opacity:0.9;margin-top:10px;">Advanced targeting</div>
  <div style="font-size:11px;opacity:0.9;">Real-time analytics</div>
  <div style="font-size:11px;opacity:0.9;">High CPMs</div>
  <button style="background:white;color:#4facfe;border:none;padding:8px 16px;border-radius:4px;margin-top:20px;cursor:pointer;font-weight:bold;font-size:12px;">Learn More</button>
</div>',
160, 600, 'https://example.com/demo-click', true, NOW()),

('550e8400-e29b-41d4-a716-446655440004', 'Half Page Demo', 'half-page',
'<div style="width:300px;height:600px;background:linear-gradient(180deg,#fa709a 0%,#fee140 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;color:white;font-family:Arial;text-align:center;padding:20px;box-sizing:border-box;">
  <div style="font-size:36px;">🎯</div>
  <div style="font-size:20px;font-weight:bold;margin:10px 0;">Perfect Fit</div>
  <div style="font-size:13px;opacity:0.9;margin-top:10px;">Half-page ads deliver</div>
  <div style="font-size:13px;opacity:0.9;">exceptional engagement</div>
  <div style="margin-top:30px;padding:15px;background:rgba(255,255,255,0.2);border-radius:8px;">
    <div style="font-size:24px;font-weight:bold;">3.2x</div>
    <div style="font-size:11px;">Higher CTR</div>
  </div>
  <button style="background:white;color:#fa709a;border:none;padding:10px 20px;border-radius:4px;margin-top:20px;cursor:pointer;font-weight:bold;">Try Now</button>
</div>',
300, 600, 'https://example.com/demo-click', true, NOW()),

('550e8400-e29b-41d4-a716-446655440005', 'Native In-Feed Demo', 'native-in-feed',
'<div style="width:300px;height:250px;background:#f8f9fa;border:1px solid #e9ecef;border-radius:8px;padding:20px;box-sizing:border-box;">
  <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px;">
    <div style="width:40px;height:40px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:50%;"></div>
    <div>
      <div style="font-size:12px;color:#6c757d;">Sponsored</div>
      <div style="font-size:14px;font-weight:bold;color:#212529;">AdServer Platform</div>
    </div>
  </div>
  <div style="font-size:13px;color:#495057;margin-bottom:12px;">Transform your inventory into revenue with our AI-powered ad optimization...</div>
  <div style="font-size:12px;color:#667eea;font-weight:bold;">Learn More →</div>
</div>',
300, 250, 'https://example.com/demo-click', true, NOW()),

('550e8400-e29b-41d4-a716-446655440006', 'Native Sponsored Demo', 'native-sponsored',
'<div style="width:300px;min-height:100px;background:#ffffff;border:1px solid #dee2e6;border-radius:4px;padding:15px;box-sizing:border-box;">
  <div style="font-size:11px;color:#868e96;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">Sponsored Content</div>
  <div style="font-size:16px;font-weight:bold;color:#212529;margin-bottom:8px;">The Future of Programmatic Advertising</div>
  <div style="font-size:13px;color:#495057;line-height:1.4;">Discover how machine learning is revolutionizing ad serving and increasing publisher revenue by up to 40%...</div>
  <div style="font-size:12px;color:#667eea;font-weight:bold;margin-top:10px;">Read Article →</div>
</div>',
300, 100, 'https://example.com/demo-click', true, NOW());

-- Insert demo slots linked to banners
INSERT INTO demo_slots (id, slot_id, name, format, width, height, demo_banner_id, created_at) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'demo-leaderboard', 'Demo Leaderboard Slot', 'leaderboard', 728, 90, '550e8400-e29b-41d4-a716-446655440001', NOW()),
('650e8400-e29b-41d4-a716-446655440002', 'demo-medium-rect', 'Demo Medium Rectangle Slot', 'medium-rectangle', 300, 250, '550e8400-e29b-41d4-a716-446655440002', NOW()),
('650e8400-e29b-41d4-a716-446655440003', 'demo-skyscraper', 'Demo Skyscraper Slot', 'skyscraper', 160, 600, '550e8400-e29b-41d4-a716-446655440003', NOW()),
('650e8400-e29b-41d4-a716-446655440004', 'demo-half-page', 'Demo Half Page Slot', 'half-page', 300, 600, '550e8400-e29b-41d4-a716-446655440004', NOW()),
('650e8400-e29b-41d4-a716-446655440005', 'demo-native-feed', 'Demo Native In-Feed Slot', 'native-in-feed', 300, 250, '550e8400-e29b-41d4-a716-446655440005', NOW()),
('650e8400-e29b-41d4-a716-446655440006', 'demo-native-sponsored', 'Demo Native Sponsored Slot', 'native-sponsored', 300, 100, '550e8400-e29b-41d4-a716-446655440006', NOW());

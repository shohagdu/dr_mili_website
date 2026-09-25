-- ============================================================
-- Seed Data for Dr. Mili Website
-- Run after schema.sql
-- ============================================================

USE drtapan;

-- ------------------------------------------------------------
-- SERVICES
-- ------------------------------------------------------------
INSERT INTO services (slug, title, category, short_description, full_content, icon, display_order) VALUES
('kidney-stone-treatment', 'Kidney Stone Treatment', 'kidney',
 'Modern medical and laser-based stone removal — ESWL, URS, RIRS, PCNL — performed with minimally invasive techniques for faster recovery.',
 '<h2>Kidney Stone Treatment</h2><p>Dr. Mili treats kidney stones using both medical management for smaller stones and advanced surgical techniques for larger or complex stones. Treatments include ESWL (shockwave), URS with laser lithotripsy, RIRS (flexible ureteroscopy), and PCNL for very large stones.</p><h3>When you need treatment</h3><p>Stones larger than 5mm, stones causing pain or blockage, recurring stones, or stones associated with infection typically need intervention. Smaller stones may pass with hydration and medication.</p><h3>What to expect</h3><p>Most modern procedures are minimally invasive, performed under spinal or general anesthesia, with hospital stays of 1–3 days and a return to normal activity within a week.</p>',
 'kidney', 1),

('prostate-treatment', 'Prostate Care & BPH Treatment', 'prostate',
 'Comprehensive prostate care including BPH, prostatitis, and PSA evaluation. Laser prostate surgery (HoLEP) and TURP available.',
 '<h2>Prostate Care</h2><p>Prostate enlargement (BPH) affects most men over 50. Symptoms include weak stream, frequent urination, urgency, and incomplete emptying. Dr. Mili offers medical therapy, minimally invasive options, and advanced laser prostate surgery.</p><h3>Treatment options</h3><ul><li>Medical therapy (alpha-blockers, 5-ARIs)</li><li>TURP (Transurethral Resection of the Prostate)</li><li>Holmium Laser Enucleation (HoLEP)</li></ul>',
 'prostate', 2),

('uti-treatment', 'Urinary Tract Infection (UTI)', 'urinary',
 'Diagnosis and management of acute, complicated, and recurrent UTIs in men and women, including investigation of underlying causes.',
 '<h2>UTI Treatment</h2><p>UTIs are common but should not be ignored. Dr. Mili provides accurate culture-based antibiotic treatment and investigates recurring infections for underlying causes such as stones, structural issues, or diabetes.</p>',
 'shield', 3),

('male-infertility', 'Male Infertility Evaluation', 'male-health',
 'Complete male infertility workup including semen analysis, hormonal evaluation, varicocele assessment, and treatment.',
 '<h2>Male Infertility</h2><p>Male factors contribute to about 40% of infertility cases. Dr. Mili offers comprehensive evaluation and treatment for conditions including varicocele, low sperm count, hormonal imbalances, and obstructive causes.</p>',
 'users', 4),

('erectile-dysfunction', 'Erectile Dysfunction (ED) Treatment', 'male-health',
 'Confidential evaluation and treatment of erectile dysfunction including medical therapy, lifestyle counseling, and advanced options.',
 '<h2>ED Treatment</h2><p>ED is common and treatable. Dr. Mili offers a confidential, professional consultation to identify causes (vascular, hormonal, psychological, or medication-related) and recommend the right treatment.</p>',
 'heart', 5),

('endourology', 'Endourology & Laser Surgery', 'surgery',
 'Advanced endoscopic and laser-based urological procedures — minimally invasive, faster recovery, shorter hospital stay.',
 '<h2>Endourology & Laser Surgery</h2><p>Endourology uses thin scopes and laser energy to treat urological problems with minimal cutting. Procedures include URS, RIRS, PCNL, HoLEP, and cystoscopy with laser treatment of bladder lesions.</p>',
 'zap', 6);

-- ------------------------------------------------------------
-- FAQS
-- ------------------------------------------------------------
INSERT INTO faqs (question, answer, category, display_order) VALUES
('When should I see a urologist?',
 'You should consult a urologist if you experience blood in urine, persistent burning or pain during urination, difficulty passing urine, lower abdominal or flank pain, repeated UTIs, prostate-related symptoms in men over 40, or fertility concerns.',
 'general', 1),

('Are all kidney stones treated with surgery?',
 'No. Small stones (typically under 5 mm) often pass with hydration and medication. Larger stones, or those causing blockage, infection, or persistent pain, usually need procedures like ESWL, URS (laser), or PCNL.',
 'kidney_stone', 2),

('Is enlarged prostate (BPH) the same as prostate cancer?',
 'No. BPH is a non-cancerous enlargement of the prostate that is very common in men over 50. However, the symptoms can overlap with prostate cancer, so proper evaluation including PSA testing and examination is important.',
 'prostate', 3),

('Does laser prostate surgery require a long hospital stay?',
 'Laser prostate procedures generally allow shorter hospital stays (often 1–2 days) and faster return to normal activity compared to traditional open surgery.',
 'prostate', 4),

('Can male infertility be treated?',
 'In many cases, yes. Causes such as varicocele, infections, hormonal imbalance, or obstruction are often treatable. A semen analysis and hormonal evaluation are the first steps.',
 'male_health', 5),

('What should I bring to my first appointment?',
 'Bring any previous reports (urine tests, blood tests, ultrasound, CT scans), your current medication list, and a written list of your symptoms with how long they have been present.',
 'general', 6),

('Do you treat both men and women?',
 'Yes. Urological conditions affect both sexes. Conditions like UTIs, kidney stones, bladder problems, and urinary incontinence are seen in both men and women.',
 'general', 7);

-- ------------------------------------------------------------
-- SITE SETTINGS
-- ------------------------------------------------------------
INSERT INTO site_settings (setting_key, setting_value) VALUES
('doctor_name',         'Prof. Dr. Maksuda Farida Akhtar (Mili)'),
('doctor_qualifications','MBBS, FCPS (Urology)'),
('doctor_specialty',    'Urologist & Urological Surgeon'),
('doctor_experience_years', '16'),
('chamber_name',        'CKD & Urology Hospital'),
('chamber_address',     '32 Road No. 3, Shyamoli, Dhaka-1207, Bangladesh'),
('chamber_phone_1',     '+880 9611-530530'),
('chamber_phone_2',     '+880 1777-685821'),
('chamber_phone_3',     '+880 1777-685822'),
('chamber_hours',       '24 Hours'),
('chamber_lat',         '23.7747'),
('chamber_lng',         '90.3618');

-- ------------------------------------------------------------
-- DEFAULT ADMIN USER
-- Password: ChangeMe@2026  (CHANGE IMMEDIATELY after first login)
-- Hash generated with argon2 — replace with a fresh hash in production
-- ------------------------------------------------------------
-- Run this in Rust on first deploy instead of seeding:
--   cargo run --bin create-admin -- admin@drtapan.com "Strong Password"
--
-- Placeholder row (will not work for login — set password via admin tool):
INSERT INTO admin_users (email, password_hash, full_name, role) VALUES
('admin@drtapan.com',
 '$argon2id$v=19$m=19456,t=2,p=1$PLACEHOLDER_REPLACE_ME$PLACEHOLDER',
 'Site Administrator',
 'admin');

-- ------------------------------------------------------------
-- SAMPLE BLOG POST (so blog page isn't empty on first launch)
-- ------------------------------------------------------------
INSERT INTO blog_posts (slug, title, excerpt, content, tags, reading_time_minutes, is_published, published_at) VALUES
('7-ways-to-prevent-kidney-stones',
 '7 Proven Ways to Prevent Kidney Stones',
 'Simple, evidence-based steps you can take today to reduce your risk of developing kidney stones — including hydration targets and dietary guidance.',
 '<h2>1. Drink Plenty of Water</h2><p>The single most effective prevention measure is drinking 2.5–3 litres of water daily, enough to produce about 2 litres of urine.</p><h2>2. Reduce Salt Intake</h2><p>High sodium increases calcium in urine. Limit processed foods, packaged snacks, and added salt at the table.</p><h2>3. Moderate Animal Protein</h2><p>Excessive red meat, poultry, and fish can raise stone risk by increasing uric acid and reducing urinary citrate.</p><h2>4. Don''t Skip Dietary Calcium</h2><p>Counterintuitive but true: adequate dietary calcium (from milk, yogurt) actually helps prevent stones by binding oxalate in the gut. Avoid only excessive calcium supplements without medical advice.</p><h2>5. Limit Oxalate-Rich Foods (Selectively)</h2><p>If you have had calcium oxalate stones, moderate spinach, beets, rhubarb, and excessive nuts.</p><h2>6. Stay Physically Active</h2><p>Sedentary lifestyle is a risk factor. Regular moderate exercise helps.</p><h2>7. Follow Up After a Stone Episode</h2><p>Stone recurrence is common without prevention. A 24-hour urine test can identify your specific risk factors and guide a personalized prevention plan.</p>',
 'kidney stones, prevention, urology, hydration',
 4, TRUE, NOW());

-- ------------------------------------------------------------
-- SAMPLE TESTIMONIAL
-- ------------------------------------------------------------
INSERT INTO testimonials (patient_name, location, rating, message, treatment_for, is_published, consent_given, display_order) VALUES
('A. Rahman', 'Mirpur, Dhaka', 5,
 'Dr. Mili explained my kidney stone treatment clearly and the laser procedure was painless. I was back to work within days.',
 'Kidney stone (laser surgery)', TRUE, TRUE, 1);

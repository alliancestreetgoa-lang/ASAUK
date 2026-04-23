from fpdf import FPDF
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "public" / "uk-tax-saving-checklist.pdf"
ACCENT = (251, 191, 36)
DARK = (15, 15, 15)
MUTED = (110, 110, 110)

class PDF(FPDF):
    def header(self):
        self.set_fill_color(*DARK)
        self.rect(0, 0, self.w, 28, 'F')
        self.set_text_color(*ACCENT)
        self.set_font("Helvetica", "B", 10)
        self.set_xy(15, 10)
        self.cell(0, 5, "ALLIANCE STREET ACCOUNTANCY LTD", ln=1)
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "", 8)
        self.set_x(15)
        self.cell(0, 5, "UK Tax Saving Checklist  -  Updated for 2025/26", ln=1)
        self.ln(10)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*MUTED)
        self.cell(0, 5, f"Alliance Street Accountancy Ltd  -  Page {self.page_no()}", align="C")

pdf = PDF()
pdf.set_auto_page_break(auto=True, margin=18)
pdf.add_page()

pdf.set_text_color(*DARK)
pdf.set_font("Helvetica", "B", 22)
pdf.cell(0, 10, "UK Tax Saving Checklist", ln=1)
pdf.set_font("Helvetica", "", 11)
pdf.set_text_color(80, 80, 80)
pdf.multi_cell(0, 6, "A practical checklist to help UK business owners and contractors reduce their tax bill, stay compliant with HMRC, and keep more of what they earn. Review each item with your accountant.")
pdf.ln(4)

SECTIONS = [
    ("Personal Allowances & Income Tax", [
        "Use your full Personal Allowance (GBP 12,570) each tax year.",
        "Claim Marriage Allowance if your spouse earns under the threshold.",
        "Plan salary vs dividends split to minimise combined tax and NI.",
        "Avoid the 60% effective tax trap between GBP 100,000 and GBP 125,140.",
        "Utilise the GBP 500 dividend allowance (reduced from 2024/25).",
        "Use the GBP 1,000 personal savings allowance on interest income.",
    ]),
    ("Pensions & Long-Term Planning", [
        "Maximise pension contributions up to the GBP 60,000 annual allowance.",
        "Carry forward unused annual allowance from the last 3 tax years.",
        "Use employer pension contributions to reduce corporation tax.",
        "Consider a SSAS or SIPP for director pension flexibility.",
        "Review tapered annual allowance if total income exceeds GBP 260,000.",
    ]),
    ("Business & Corporation Tax", [
        "Claim every allowable business expense - software, subscriptions, travel.",
        "Use the GBP 1m Annual Investment Allowance on qualifying equipment.",
        "Claim R&D tax relief if you develop software or new products.",
        "Make use of full expensing on qualifying plant and machinery.",
        "Pay yourself an optimal director's salary (typically GBP 12,570).",
        "Extract profits via dividends up to the basic-rate band.",
        "Review loans to directors to avoid Section 455 tax.",
    ]),
    ("VAT & Making Tax Digital", [
        "Check if the Flat Rate Scheme saves you money vs Standard VAT.",
        "Register for VAT voluntarily if most clients are VAT-registered.",
        "Ensure your bookkeeping software is MTD-compliant.",
        "Reclaim pre-registration VAT on goods (4 yrs) and services (6 mo).",
        "Use the Cash Accounting Scheme if cash flow is tight.",
    ]),
    ("Capital Gains & Property", [
        "Use the GBP 3,000 annual CGT exemption (2024/25 onwards).",
        "Claim Business Asset Disposal Relief (10% CGT up to GBP 1m).",
        "Transfer assets between spouses to double allowances.",
        "Keep records of improvements to reduce chargeable gains.",
        "Consider holding property via a limited company where beneficial.",
    ]),
    ("Payroll, PAYE & Employment", [
        "Claim the GBP 5,000 Employment Allowance if eligible.",
        "Offer salary sacrifice for pensions, cycle-to-work, EV schemes.",
        "Reimburse tax-free expenses - mileage, home office, subsistence.",
        "Review P11D benefits and consider tax-efficient alternatives.",
        "Use trivial benefits (up to GBP 50) for staff rewards.",
    ]),
    ("Deadlines & Compliance", [
        "Self-Assessment filing deadline: 31 January (online).",
        "Corporation Tax payment: 9 months and 1 day after year-end.",
        "VAT returns: typically 1 month and 7 days after quarter-end.",
        "Confirmation Statement: annually at Companies House.",
        "Keep all records for at least 6 years (HMRC requirement).",
    ]),
]

def draw_check(pdf):
    x, y = pdf.get_x(), pdf.get_y() + 1.3
    pdf.set_fill_color(*ACCENT)
    pdf.circle(x + 1.8, y + 1.8, 1.8, style='F')
    pdf.set_xy(x + 6, y - 1.3)

for title, items in SECTIONS:
    if pdf.get_y() > 240:
        pdf.add_page()
    pdf.set_font("Helvetica", "B", 13)
    pdf.set_text_color(*DARK)
    pdf.ln(2)
    pdf.cell(0, 8, title, ln=1)
    pdf.set_draw_color(*ACCENT)
    pdf.set_line_width(0.6)
    pdf.line(pdf.get_x(), pdf.get_y(), pdf.get_x() + 30, pdf.get_y())
    pdf.ln(3)
    pdf.set_font("Helvetica", "", 10)
    pdf.set_text_color(45, 45, 45)
    for item in items:
        if pdf.get_y() > 265:
            pdf.add_page()
        draw_check(pdf)
        pdf.multi_cell(0, 5.5, item)
        pdf.ln(1)
    pdf.ln(3)

if pdf.get_y() > 230:
    pdf.add_page()
pdf.ln(5)
pdf.set_fill_color(245, 245, 245)
pdf.set_draw_color(220, 220, 220)
pdf.rect(pdf.get_x(), pdf.get_y(), pdf.w - 30, 36, 'DF')
pdf.ln(4)
pdf.set_font("Helvetica", "B", 12)
pdf.set_text_color(*DARK)
pdf.cell(0, 6, "Need help applying these?", ln=1)
pdf.set_font("Helvetica", "", 10)
pdf.set_text_color(80, 80, 80)
pdf.multi_cell(0, 5.5, "Book a free consultation with Alliance Street Accountancy Ltd and get a tailored tax-saving plan for your business.")
pdf.ln(1)
pdf.set_text_color(*DARK)
pdf.set_font("Helvetica", "B", 10)
pdf.cell(0, 5, "Email: shaukin@alliancestreet.ae   -   Phone: +91 7375096163", ln=1)
pdf.set_font("Helvetica", "", 9)
pdf.set_text_color(110, 110, 110)
pdf.cell(0, 5, "Pine Tree House, Gardiners Close, Basildon, Essex, SS14 3AN", ln=1)

pdf.ln(6)
pdf.set_font("Helvetica", "I", 8)
pdf.set_text_color(140, 140, 140)
pdf.multi_cell(0, 4, "Disclaimer: This checklist is for general information only and does not constitute tax advice. Every business is different - consult a qualified accountant before acting on any of these items.")

OUT.parent.mkdir(parents=True, exist_ok=True)
pdf.output(str(OUT))
print(f"wrote {OUT} ({OUT.stat().st_size} bytes)")

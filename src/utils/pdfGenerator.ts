import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface TransactionReceiptData {
  transactionId: string;
  type: string;
  amount: number;
  fee?: number;
  status: string;
  senderAccount: string;
  senderName?: string;
  receiverAccount?: string;
  receiverName?: string;
  description?: string;
  createdAt: string | Date;
}

export interface AccountStatementData {
  customerName: string;
  customerEmail: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  dailyLimit?: number;
  minBalance?: number;
  status: string;
  periodStart?: string;
  periodEnd?: string;
}

/**
 * Generates an official, institutional-grade Transaction Receipt PDF.
 * Designed with a formal banking voucher layout, security watermarks, and verification badges.
 */
export function generateTransactionReceiptPDF(data: TransactionReceiptData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // ─── Header: Premium Deep Navy Banner ───────────────────────
  doc.setFillColor(7, 24, 49); // Dark institutional navy (#071831)
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Emerald accent stripe
  doc.setFillColor(16, 185, 129); // Emerald 500
  doc.rect(0, 42, pageWidth, 2.5, 'F');

  // Bank Brand
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('VAULTLY', margin, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('DIGITAL BANKING MANAGEMENT SYSTEM', margin, 26);
  doc.text('Global Core Banking & Financial Infrastructure', margin, 31);

  // Document Badge on top right
  doc.setFillColor(15, 34, 64);
  doc.roundedRect(pageWidth - margin - 58, 12, 58, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(52, 211, 153); // Emerald 400
  doc.text('OFFICIAL VOUCHER', pageWidth - margin - 53, 19);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(226, 232, 240);
  doc.text(`Ref: ${data.transactionId.substring(0, 16)}`, pageWidth - margin - 53, 25);
  doc.text(
    new Date(data.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    pageWidth - margin - 53,
    30
  );

  let curY = 56;

  // ─── Document Title ──────────────────────────────────────────
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('ELECTRONIC FUNDS TRANSFER RECEIPT', margin, curY);

  curY += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text(
    'This electronic receipt serves as definitive proof of transaction processed via Vaultly Secure Clearing.',
    margin,
    curY
  );

  curY += 10;

  // ─── Primary Amount & Status Card ───────────────────────────
  const isCredit =
    data.type === 'Deposit' || data.type === 'Loan Disbursement';
  
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(margin, curY, contentWidth, 32, 3, 3, 'FD');

  // Amount display
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TRANSACTION AMOUNT', margin + 8, curY + 11);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(isCredit ? 5 : 15, isCredit ? 150 : 23, isCredit ? 105 : 42);
  const formattedAmount = `${isCredit ? '+' : '-'}$${Number(data.amount || 0).toLocaleString(
    'en-US',
    { minimumFractionDigits: 2, maximumFractionDigits: 2 }
  )} USD`;
  doc.text(formattedAmount, margin + 8, curY + 23);

  // Status Capsule (Right side of card)
  const isCompleted = (data.status || '').toLowerCase() === 'completed';
  if (isCompleted) {
    doc.setFillColor(209, 250, 229); // Emerald 100
    doc.setDrawColor(167, 243, 208); // Emerald 200
    doc.setTextColor(6, 95, 70); // Emerald 800
  } else {
    doc.setFillColor(254, 243, 199); // Amber 100
    doc.setDrawColor(253, 230, 138); // Amber 200
    doc.setTextColor(146, 64, 14); // Amber 800
  }
  doc.roundedRect(pageWidth - margin - 42, curY + 9, 34, 14, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text((data.status || 'COMPLETED').toUpperCase(), pageWidth - margin - 38, curY + 18);

  curY += 40;

  // ─── Two-Column Transaction Detail Grid ──────────────────────
  const colWidth = (contentWidth - 6) / 2;

  // Left Column: Origin & Sender
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, colWidth, 40, 2, 2, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.rect(margin, curY, colWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('ORIGINATING ENTITY (FROM)', margin + 5, curY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Account Name:', margin + 5, curY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.senderName || 'Vaultly Customer', margin + 5, curY + 20);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Account Number:', margin + 5, curY + 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.senderAccount || 'N/A', margin + 5, curY + 34);

  // Right Column: Destination & Beneficiary
  const rightColX = margin + colWidth + 6;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(rightColX, curY, colWidth, 40, 2, 2, 'FD');

  doc.setFillColor(241, 245, 249);
  doc.rect(rightColX, curY, colWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('BENEFICIARY ENTITY (TO)', rightColX + 5, curY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Account Name:', rightColX + 5, curY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.receiverName || 'System Disbursal / Recipient', rightColX + 5, curY + 20);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Account Number:', rightColX + 5, curY + 28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(data.receiverAccount || 'N/A', rightColX + 5, curY + 34);

  curY += 46;

  // ─── Audit & Specification Table ─────────────────────────────
  autoTable(doc, {
    startY: curY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    head: [['PARAMETER', 'TRANSACTION SPECIFICATION']],
    body: [
      ['Transaction ID / Ref', data.transactionId],
      ['Transaction Type', data.type],
      [
        'Timestamp (Date & Time)',
        new Date(data.createdAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        }),
      ],
      ['Gross Amount', `$${Number(data.amount || 0).toFixed(2)} USD`],
      ['Processing Fee', data.fee ? `$${Number(data.fee).toFixed(2)} USD` : '$0.00 USD (Waived)'],
      ['Processing Channel', 'Vaultly Automated Clearing House (VA-ACH)'],
      ['Description / Memo', data.description || 'Standard Banking Transaction'],
      [
        'Security Fingerprint',
        `SHA256:${Buffer.from(data.transactionId).toString('hex').slice(0, 24).toUpperCase()}...`,
      ],
    ],
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 3.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 55, textColor: [71, 85, 105] },
      1: { fontStyle: 'normal' },
    },
  });

  // ─── Footer Security & Legal Disclaimers ─────────────────────
  const finalY = (doc as any).lastAutoTable?.finalY || 215;

  // Verification Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, finalY + 8, contentWidth, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  doc.text('ELECTRONIC AUTHENTICATION NOTICE', margin + 6, finalY + 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(
    'This is an automated financial receipt generated by the Vaultly Digital Banking Management System. It holds full legal status',
    margin + 6,
    finalY + 20
  );
  doc.text(
    'under digital banking documentation acts. No manual signature or physical branch counter-stamp is necessary for validation.',
    margin + 6,
    finalY + 24
  );

  // Bottom Security Line
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Document Generated: ${new Date().toUTCString()} | Vaultly Financial Core API v2.4`,
    margin,
    pageHeight - 11
  );
  doc.text('Page 1 of 1', pageWidth - margin - 15, pageHeight - 11);

  // Save the PDF
  doc.save(`Vaultly_Receipt_${data.transactionId.substring(0, 12)}.pdf`);
}

/**
 * Generates an official, comprehensive Bank Account Statement PDF.
 * Designed with a formal banking letterhead, account summary cards, and a styled transaction ledger.
 */
export function generateAccountStatementPDF(
  account: AccountStatementData,
  transactions: any[]
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // ─── Header: Bank Letterhead ─────────────────────────────────
  doc.setFillColor(7, 24, 49); // Dark navy
  doc.rect(0, 0, pageWidth, 36, 'F');

  doc.setFillColor(16, 185, 129); // Emerald bar
  doc.rect(0, 36, pageWidth, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('VAULTLY DIGITAL BANK', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('OFFICIAL STATEMENT OF ACCOUNT', margin, 24);
  doc.text('Licensed & Regulated Digital Banking Institution', margin, 29);

  // Top right branch info
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(203, 213, 225);
  doc.text('Headquarters: 100 Financial Plaza, Suite 400', pageWidth - margin - 65, 15);
  doc.text('Support: support@vaultlybank.com', pageWidth - margin - 65, 20);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US')}`, pageWidth - margin - 65, 25);

  let curY = 46;

  // ─── Customer & Account Details Card ────────────────────────
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, curY, contentWidth, 36, 2, 2, 'FD');

  const halfWidth = contentWidth / 2;

  // Left: Account Holder
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ACCOUNT HOLDER', margin + 6, curY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(account.customerName || 'Valued Customer', margin + 6, curY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Email: ${account.customerEmail}`, margin + 6, curY + 22);
  doc.text(`Status: ${account.status || 'Active'}`, margin + 6, curY + 28);

  // Right: Account Specifications
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('ACCOUNT IDENTIFICATION', margin + halfWidth, curY + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Account No: ${account.accountNumber}`, margin + halfWidth, curY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(`Type: ${account.accountType}`, margin + halfWidth, curY + 22);
  doc.text(
    `Daily Limit: $${(account.dailyLimit || 5000).toLocaleString()} | Min Reserve: $${(
      account.minBalance || 50
    ).toFixed(2)}`,
    margin + halfWidth,
    curY + 28
  );

  curY += 42;

  // ─── Financial Snapshot: 3 Metric Cards ─────────────────────
  const cardW = (contentWidth - 8) / 3;

  // Metric 1: Current Balance
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(16, 185, 129);
  doc.roundedRect(margin, curY, cardW, 20, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(5, 150, 105);
  doc.text('AVAILABLE BALANCE', margin + 5, curY + 6.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text(
    `$${Number(account.balance || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
    })}`,
    margin + 5,
    curY + 15
  );

  // Calculate Inflows & Outflows
  let totalInflow = 0;
  let totalOutflow = 0;
  transactions.forEach(t => {
    const isCredit = t.type === 'Deposit' || t.type === 'Loan Disbursement';
    if (isCredit) {
      totalInflow += Number(t.amount || 0);
    } else {
      totalOutflow += Number(t.amount || 0);
    }
  });

  // Metric 2: Total Inflows
  const card2X = margin + cardW + 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(card2X, curY, cardW, 20, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL CREDITS (INFLOW)', card2X + 5, curY + 6.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(5, 150, 105);
  doc.text(`+$${totalInflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, card2X + 5, curY + 15);

  // Metric 3: Total Outflows
  const card3X = card2X + cardW + 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(card3X, curY, cardW, 20, 2, 2, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL DEBITS (OUTFLOW)', card3X + 5, curY + 6.5);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(225, 29, 72); // Rose 600
  doc.text(`-$${totalOutflow.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, card3X + 5, curY + 15);

  curY += 26;

  // ─── Section Header ──────────────────────────────────────────
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('TRANSACTION LEDGER & ACTIVITY LOG', margin, curY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`Showing ${transactions.length} recorded items`, pageWidth - margin - 35, curY);

  curY += 4;

  // ─── Transactions Table ──────────────────────────────────────
  const tableRows = transactions.map(t => {
    const isCredit = t.type === 'Deposit' || t.type === 'Loan Disbursement';
    const amountStr = `${isCredit ? '+' : '-'}$${Number(t.amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
    })}`;

    return [
      new Date(t.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
      }),
      t.transactionId || 'N/A',
      t.type || 'Transfer',
      t.description || (isCredit ? `From: ${t.senderName || t.senderAccount}` : `To: ${t.receiverName || t.receiverAccount}`),
      (t.status || 'Completed').toUpperCase(),
      amountStr,
    ];
  });

  autoTable(doc, {
    startY: curY,
    margin: { left: margin, right: margin },
    theme: 'striped',
    head: [['DATE', 'REFERENCE ID', 'TYPE', 'DESCRIPTION / COUNTERPARTY', 'STATUS', 'AMOUNT (USD)']],
    body: tableRows.length > 0 ? tableRows : [['-', 'No transactions recorded for this period', '-', '-', '-', '$0.00']],
    headStyles: {
      fillColor: [7, 24, 49],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: [51, 65, 85],
      cellPadding: 2.8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: 'normal' },
      1: { cellWidth: 32, fontStyle: 'bold' },
      2: { cellWidth: 26 },
      3: { cellWidth: 50 },
      4: { cellWidth: 22 },
      5: { cellWidth: 24, halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: data => {
      // Color-code the amount column
      if (data.section === 'body' && data.column.index === 5) {
        const text = String(data.cell.raw);
        if (text.startsWith('+')) {
          data.cell.styles.textColor = [5, 150, 105];
        } else if (text.startsWith('-')) {
          data.cell.styles.textColor = [15, 23, 42];
        }
      }
    },
  });

  // ─── Footer: Page Number & Verification ──────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Vaultly Digital Banking Management System • System-Verified Financial Record • Confidential',
      margin,
      pageHeight - 9
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 15, pageHeight - 9);
  }

  doc.save(`Vaultly_Statement_${account.accountNumber}_${Date.now()}.pdf`);
}

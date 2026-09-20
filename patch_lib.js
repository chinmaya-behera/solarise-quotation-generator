const fs = require('fs');
let file = fs.readFileSync('lib/quotation.ts', 'utf8');

// Add new fields to quotationSchema
file = file.replace(
  '    address: z.string(),',
  `    address: z.string(),
    electricBillAmount: z.number().min(0).optional(),
    rooftopArea: z.number().min(0).optional(),
    paymentMethod: z.string().optional(),`
);

// Add new fields to defaultQuotation.client
file = file.replace(
  '    address: "",',
  `    address: "",
    electricBillAmount: 0,
    rooftopArea: 0,
    paymentMethod: "",`
);

fs.writeFileSync('lib/quotation.ts', file);

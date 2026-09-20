const fs = require('fs');
let file = fs.readFileSync('components/quotation-form.tsx', 'utf8');

// I might have appended it multiple times before, so I'm doing a fresh checkout and then finding the exact location
let index = file.indexOf('</Field>', file.indexOf('<Field label="Client signatory label">'));
let endIndex = index + 8; // length of </Field>

let newInputs = `
          <Field label="Electric Bill Amount (₹)">
            <TextInput
              type="number"
              value={q.client.electricBillAmount?.toString() || ''}
              onChange={(e) => patch("client", { electricBillAmount: Number(e.target.value) })}
              placeholder="e.g. 5000"
            />
          </Field>
          <Field label="Rooftop Area (sq.ft)">
            <TextInput
              type="number"
              value={q.client.rooftopArea?.toString() || ''}
              onChange={(e) => patch("client", { rooftopArea: Number(e.target.value) })}
              placeholder="e.g. 500"
            />
          </Field>
          <Field label="Payment Method (Cash / Loan)">
            <TextInput
              value={q.client.paymentMethod || ''}
              onChange={(e) => patch("client", { paymentMethod: e.target.value })}
              placeholder="e.g. Loan"
            />
          </Field>
          <div className="pt-2 pb-4">
            <GhostButton
              type="button"
              className="w-full"
              onClick={() => {
                let suggestedCapacity = q.system.acCapacity;
                if (q.client.rooftopArea && q.client.rooftopArea > 0) {
                  suggestedCapacity = Math.max(suggestedCapacity, q.client.rooftopArea / 100);
                } else if (q.client.electricBillAmount && q.client.electricBillAmount > 0) {
                  suggestedCapacity = Math.max(suggestedCapacity, q.client.electricBillAmount / 1000);
                }
                patch("system", { acCapacity: suggestedCapacity });
              }}
            >
              Auto Suggest Capacity
            </GhostButton>
          </div>
`;

file = file.slice(0, endIndex) + newInputs + file.slice(endIndex);

fs.writeFileSync('components/quotation-form.tsx', file);

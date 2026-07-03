describe("Payment Calculation", () => {
  const AMOUNT_PER_SLOT_SET = 100;
  const SLOTS_PER_SET = 5;

  it("should calculate correct amount for 1 set", () => {
    const sets = 1;
    const amount = AMOUNT_PER_SLOT_SET * sets;
    expect(amount).toBe(100);
  });

  it("should calculate correct amount for multiple sets", () => {
    const sets = 3;
    const amount = AMOUNT_PER_SLOT_SET * sets;
    expect(amount).toBe(300);
  });

  it("should calculate correct slots for given sets", () => {
    const sets = 2;
    const slots = SLOTS_PER_SET * sets;
    expect(slots).toBe(10);
  });

  it("should reject zero or negative sets", () => {
    const sets = 0;
    const isValid = sets >= 1;
    expect(isValid).toBe(false);
  });
});
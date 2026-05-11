export function formatTHB(amount, isDisplayCurrency = true) {
    if (!isDisplayCurrency) {
        return parseFloat(amount).toLocaleString('th-TH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    return parseFloat(amount).toLocaleString('th-TH', {
        style: 'currency',
        currency: 'THB'
    })
}
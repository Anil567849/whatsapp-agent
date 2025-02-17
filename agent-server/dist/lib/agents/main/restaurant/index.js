"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.restaurantAgentMap = exports.CashierAgent = void 0;
const types_1 = require("../../../../stringai/types");
exports.CashierAgent = new types_1.Agent({
    name: "Cashier Agent",
    instructions: "You are a cashier agent. Your task is to understand the customer's need and determine which agent is best suited to handle and transfer the conversation to the appropriate agent.",
    functions: [transferToSalesAgent, transferToPaymentAgent]
});
const SalesAgent = new types_1.Agent({
    name: "Sales Agent",
    instructions: "You are a sales agent. Be super enthusiastic about selling our items. If you can't handle the customer, transfer the conversation to the cashier agent.",
    functions: [transferToCashierAgent, getPriceOfItem]
});
const PaymentAgent = new types_1.Agent({
    name: "Payment Agent",
    instructions: "You are a payment agent. Your task is to take the payment from the customer and send them QR Code to get payment. If user say payment is confirmed then ask them screenshot and verify that first. If payment is done then order the item otherwise  inform the customer about the unsuccessful payment and ask the customer to try again. If you can't handle the customer, transfer the conversation to the cashier agent.",
    functions: [transferToCashierAgent, sendQrCodeToCustomer, verifyPayment, orderItem]
});
function transferToCashierAgent() {
    return exports.CashierAgent;
}
function transferToPaymentAgent() {
    return PaymentAgent;
}
function transferToSalesAgent() {
    return SalesAgent;
}
function getPriceOfItem(item) {
    // This is a dummy function to simulate the price of an item
    return '100';
}
function sendQrCodeToCustomer() {
    // This is a dummy function to simulate sending a QR code to the customer
    return 'QR code sent to customer';
}
function verifyPayment(payment) {
    // This is a dummy function to simulate verifying a payment
    return 'Payment verified';
}
function orderItem(item) {
    // This is a dummy function to simulate ordering an item
    return 'Item ordered';
}
exports.restaurantAgentMap = new Map([
    ['Cashier Agent', exports.CashierAgent],
    ['Sales Agent', SalesAgent],
    ['Payment Agent', PaymentAgent]
]);

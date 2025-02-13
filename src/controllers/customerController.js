const Customer = require('../models/customer');
const rabbitService = require('../services/rabbitService');

exports.getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find();
    res.json(customers);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createCustomer = async (req, res) => {
  try {
    const newCustomer = new Customer(req.body);
    await newCustomer.save();
    rabbitService.publishMessage('customer.created', { id: newCustomer._id.toString(), email: newCustomer.email });
    res.status(201).json(newCustomer);
  } catch (err) {
    res.status(500).json({ error: 'Creation error' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!customer) return res.status(404).json({ error: 'Not found' });
    rabbitService.publishMessage('customer.updated', { id: customer._id.toString() });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: 'Update error' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) return res.status(404).json({ error: 'Not found' });
    rabbitService.publishMessage('customer.deleted', { id: customer._id.toString() });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Deletion error' });
  }
};

jest.resetModules();
jest.setTimeout(30000);

const customerController = require('../src/controllers/customerController');
const Customer = require('../src/models/customer');
const { publishMessage } = require('../src/services/rabbitService');

if (!process.env.JWT_SECRET) {
  require('dotenv').config({ path: '.env.test' });
}

// Création d'objets factices pour simuler req et res
let req, res;
beforeEach(() => {
  req = {};
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn()
  };
  jest.clearAllMocks();
});

describe('Tests directs du contrôleur client', () => {

  describe('getCustomers', () => {
    it('doit renvoyer la liste des clients quand Customer.find réussit (bloc try)', async () => {
      const clientsFictifs = [{ name: 'Alice' }, { name: 'Bob' }];
      jest.spyOn(Customer, 'find').mockResolvedValue(clientsFictifs);
      
      await customerController.getCustomers(req, res);
      
      expect(Customer.find).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(clientsFictifs);
      Customer.find.mockRestore();
    });

    it('doit renvoyer une erreur 500 quand Customer.find lève une erreur (bloc catch)', async () => {
      jest.spyOn(Customer, 'find').mockRejectedValue(new Error('échec'));
      
      await customerController.getCustomers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
      Customer.find.mockRestore();
    });
  });

  describe('getCustomerById', () => {
    it('doit renvoyer le client quand il est trouvé (bloc try)', async () => {
      const clientFictif = { _id: '1', name: 'Alice' };
      req.params = { id: '1' };
      jest.spyOn(Customer, 'findById').mockResolvedValue(clientFictif);
      
      await customerController.getCustomerById(req, res);
      
      expect(Customer.findById).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith(clientFictif);
      Customer.findById.mockRestore();
    });

    it('doit renvoyer 404 si le client n’est pas trouvé', async () => {
      req.params = { id: '1' };
      jest.spyOn(Customer, 'findById').mockResolvedValue(null);
      
      await customerController.getCustomerById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
      Customer.findById.mockRestore();
    });

    it('doit renvoyer 500 quand Customer.findById lève une erreur (bloc catch)', async () => {
      req.params = { id: '1' };
      jest.spyOn(Customer, 'findById').mockRejectedValue(new Error('échec'));
      
      await customerController.getCustomerById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Server error' });
      Customer.findById.mockRestore();
    });
  });

  describe('createCustomer', () => {
    let publishSpy;
    beforeEach(() => {
      publishSpy = jest.spyOn(require('../src/services/rabbitService'), 'publishMessage')
                     .mockImplementation(() => Promise.resolve());
    });
    afterEach(() => {
      publishSpy.mockRestore();
    });


    it('doit renvoyer 500 quand la sauvegarde échoue (bloc catch)', async () => {
      req.body = { name: 'Fail', email: 'fail@example.com' };
      jest.spyOn(Customer.prototype, 'save').mockRejectedValue(new Error('échec'));
      
      await customerController.createCustomer(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Creation error' });
      Customer.prototype.save.mockRestore();
    });
  });

  describe('updateCustomer', () => {
    let publishSpy;
    beforeEach(() => {
      publishSpy = jest.spyOn(require('../src/services/rabbitService'), 'publishMessage')
                     .mockImplementation(() => Promise.resolve());
    });
    afterEach(() => {
      publishSpy.mockRestore();
    });

    it('doit mettre à jour un client existant et appeler publishMessage (bloc try)', async () => {
      req.params = { id: '1' };
      req.body = { name: 'Updated' };
      const clientFictif = { _id: '1', name: 'Updated' };
      jest.spyOn(Customer, 'findByIdAndUpdate').mockResolvedValue(clientFictif);
      
      await customerController.updateCustomer(req, res);
      
      expect(Customer.findByIdAndUpdate).toHaveBeenCalledWith('1', { name: 'Updated' }, { new: true });
      expect(res.json).toHaveBeenCalledWith(clientFictif);
      expect(publishSpy).toHaveBeenCalledWith('customer.updated', { id: '1' });
      Customer.findByIdAndUpdate.mockRestore();
    });

    it('doit renvoyer 404 si le client n’est pas trouvé (bloc try)', async () => {
      req.params = { id: '1' };
      req.body = { name: 'Updated' };
      jest.spyOn(Customer, 'findByIdAndUpdate').mockResolvedValue(null);
      
      await customerController.updateCustomer(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
      Customer.findByIdAndUpdate.mockRestore();
    });

    it('doit renvoyer 500 quand findByIdAndUpdate lève une erreur (bloc catch)', async () => {
      req.params = { id: '1' };
      req.body = { name: 'Updated' };
      jest.spyOn(Customer, 'findByIdAndUpdate').mockRejectedValue(new Error('échec'));
      
      await customerController.updateCustomer(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Update error' });
      Customer.findByIdAndUpdate.mockRestore();
    });
  });

  describe('deleteCustomer', () => {
    let publishSpy;
    beforeEach(() => {
      publishSpy = jest.spyOn(require('../src/services/rabbitService'), 'publishMessage')
                     .mockImplementation(() => Promise.resolve());
    });
    afterEach(() => {
      publishSpy.mockRestore();
    });

    it('doit supprimer un client existant et appeler publishMessage (bloc try)', async () => {
      req.params = { id: '1' };
      const clientFictif = { _id: '1', name: 'ÀSupprimer' };
      jest.spyOn(Customer, 'findByIdAndDelete').mockResolvedValue(clientFictif);
      
      await customerController.deleteCustomer(req, res);
      
      expect(Customer.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(res.json).toHaveBeenCalledWith({ message: 'Deleted' });
      expect(publishSpy).toHaveBeenCalledWith('customer.deleted', { id: '1' });
      Customer.findByIdAndDelete.mockRestore();
    });

    it('doit renvoyer 404 si le client n’est pas trouvé (bloc try)', async () => {
      req.params = { id: '1' };
      jest.spyOn(Customer, 'findByIdAndDelete').mockResolvedValue(null);
      
      await customerController.deleteCustomer(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
      Customer.findByIdAndDelete.mockRestore();
    });

    it('doit renvoyer 500 quand findByIdAndDelete lève une erreur (bloc catch)', async () => {
      req.params = { id: '1' };
      jest.spyOn(Customer, 'findByIdAndDelete').mockRejectedValue(new Error('échec'));
      
      await customerController.deleteCustomer(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Deletion error' });
      Customer.findByIdAndDelete.mockRestore();
    });
  });
});
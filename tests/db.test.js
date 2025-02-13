const mongoose = require('mongoose');
const connectDB = require('../src/config/db');

describe('connectDB', () => {
  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(process, 'exit').mockImplementation(() => {});
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should log "MongoDB connected" when connection is successful', async () => {
    mongoose.connect = jest.fn().mockResolvedValue();
    await connectDB();
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGO_URI);
    expect(console.log).toHaveBeenCalledWith('MongoDB connected');
  });

  it('should log error and call process.exit(1) when connection fails', async () => {
    const error = new Error('connection failed');
    mongoose.connect = jest.fn().mockRejectedValue(error);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {});
    await connectDB();
    expect(console.error).toHaveBeenCalledWith(error);
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});

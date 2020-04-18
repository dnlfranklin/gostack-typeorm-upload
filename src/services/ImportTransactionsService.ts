import path from 'path';
import csv from 'csvtojson';
import fs from 'fs';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();

    const filePath = path.join(uploadConfig.directory, filename);

    const transactions = [] as Transaction[];

    const csvItems = await csv().fromFile(filePath);

    const transaction = await csvItems.reduce(async (acc, data) => {
      const result = await acc;

      if (result instanceof Transaction) transactions.push(result);

      return createTransaction.execute(data);
    }, Promise.resolve());

    transactions.push(transaction);

    const csvFileExists = await fs.promises.stat(filePath);

    if (csvFileExists) {
      await fs.promises.unlink(filePath);
    }

    return transactions;
  }
}

export default ImportTransactionsService;

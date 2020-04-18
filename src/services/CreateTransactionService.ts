import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

// import Category from '../models/Category';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    if (value < 0) throw new AppError('Value not allowed for value property');

    const transactionRepository = getCustomRepository(TransactionsRepository);
    const categoryRepository = getRepository(Category);

    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();

      if (balance.total < value)
        throw new AppError('You have insufficient funds.');
    } else if (type !== 'income')
      throw new AppError('Invalid value for type property');

    const getCategoryId = async () => {
      const categoryExists = await categoryRepository.findOne({
        where: { title: category },
      });

      if (categoryExists) {
        return categoryExists.id;
      }
      const newCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(newCategory);
      return newCategory.id;
    };

    const category_id = await getCategoryId();

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;

import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

interface All {
  transactions: Transaction[];
  balance: Balance;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    const balance = transactions.reduce(
      (accumulator, transaction) => {
        const value = Number(transaction.value);
        switch (transaction.type) {
          case 'income':
            accumulator.income += value;
            accumulator.total += value;
            break;
          case 'outcome':
            accumulator.outcome += value;
            accumulator.total -= value;
            break;
          default:
            break;
        }
        return accumulator;
      },
      {
        income: 0,
        outcome: 0,
        total: 0,
      },
    );

    return balance;
  }

  public async all(): Promise<All> {
    /*
    const transactions = await this.find({
      select: ['id', 'title', 'value', 'type'],
      relations: ['category'],
    });
    */
    const transactions = await this.find({
      order: {
      	created_at: 'DESC'
      }
    });
    const balance = await this.getBalance();

    return { transactions, balance };
  }
}

export default TransactionsRepository;

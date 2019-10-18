import Sequelize, { Model } from 'sequelize';

class HelpOrder extends Model {
  static init(sequelize) {
    super.init(
      {
        student_id: Sequelize.INTEGER,
        question: Sequelize.STRING,
        answer: Sequelize.STRING,
        answerAt: Sequelize.DATE,
      },
      {
        sequelize,
      }
    );
    return this;
  }
}

export default HelpOrder;

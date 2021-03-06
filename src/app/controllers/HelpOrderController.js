import HelpOrder from '../models/HelpOrder';
import Mail from '../../lib/Mail';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    if (req.params.id) {
      const help_orders = await HelpOrder.findAll({
        where: { student_id: req.params.id },
      });
      return res.json(help_orders);
    }

    const { page = 1 } = req.query;

    const help_orders = await HelpOrder.findAll({
      where: { answer: null },
      limit: 20,
      offset: (page - 1) * 20,
    });

    return res.json(help_orders);
  }

  async store(req, res) {
    if (req.params.id) {
      const { id } = req.params;

      const { question } = req.body;

      const help_order = await HelpOrder.create({ student_id: id, question });

      return res.json(help_order);
    }

    if (req.params.answerid) {
      const { answerid } = req.params;

      const { answer } = req.body;

      const help_order = await HelpOrder.findByPk(answerid);

      const { question, student_id } = help_order;

      const help_order_answer = await HelpOrder.create({
        student_id,
        question,
        answer,
        answerAt: new Date(),
      });
      const student = await Student.findByPk(student_id);

      await Mail.sendMail({
        to: `${student.name} <${student.email}`,
        subject: 'Resposta sobre sua pergunta',
        template: 'helporder_answer',
        context: {
          name: student.name,
          question,
          answer,
        },
      });

      return res.json(help_order_answer);
    }

    return res.json();
  }
}

export default new HelpOrderController();

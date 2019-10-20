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
    const { id } = req.params;

    const help_order = await HelpOrder.create({ student_id: id });

    return res.json(help_order);
  }

  async update(req, res) {
    const { id } = req.params;

    const help_order = await HelpOrder.findOne({ where: { id } });

    const { student_id } = help_order;

    const student = await Student.findByPk(student_id);

    const { answer } = await help_order.update(req.body);

    await Mail.sendMail({
      to: `${student.name} <${student.email}`,
      subject: 'Resposta sobre sua pergunta',
      template: 'helporder_answer',
      context: {
        name: student.name,
        question: help_order.question,
        answer: help_order.answer,
      },
    });

    return res.json({
      id,
      question: help_order.question,
      answer,
      answerAt: new Date(),
    });
  }
}

export default new HelpOrderController();

import HelpOrder from '../models/HelpOrder';
import Mail from '../../lib/Mail';
import Student from '../models/Student';

class HelpOrderController {
  async index(req, res) {
    const { id } = req.params;
    const help_orders = await HelpOrder.findAll({ where: { student_id: id } });
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
      subject: 'Registration successfully',
      text: `Question:${help_order.question} Answer:${help_order.answer}`,
    });

    return res.json({
      id,
      question: help_order.question,
      answer,
      answerAt: help_order.answerAt,
    });
  }
}

export default new HelpOrderController();

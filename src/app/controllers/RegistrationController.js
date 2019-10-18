import { addMonths, parseISO } from 'date-fns';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Plan from '../models/Plan';
import Mail from '../../lib/Mail';

class RegistrationController {
  async index(req, res) {
    const registrations = await Registration.findAll();

    return res.json(registrations);
  }

  async store(req, res) {
    const { start_date, student_id, plan_id } = req.body;

    const student = await Student.findOne({ where: { id: student_id } });

    if (!student) {
      return res.status(400).json({ error: 'Student does not exist' });
    }

    const plan = await Plan.findOne({ where: { id: plan_id } });

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    let price = 0;
    const end_date = addMonths(parseISO(start_date), 3);

    switch (plan.id) {
      case 1:
        price = 129.0;
        break;
      case 2:
        price = 387.0;
        break;
      case 3:
        price = 774.0;
        break;
      default:
        price = 0;
        break;
    }

    const registration = await Registration.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    await Mail.sendMail({
      to: `${student.name} <${student.email}`,
      subject: 'Registration successfully',
      text: `Welcome to Gympoint, here are the details of your plan:Plan:${plan.title} and Price:${price} reais`,
    });

    return res.json(registration);
  }
}

export default new RegistrationController();

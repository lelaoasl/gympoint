import { addMonths, isBefore, parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt';
import * as Yup from 'yup';
import Registration from '../models/Registration';
import Student from '../models/Student';
import Plan from '../models/Plan';
import Mail from '../../lib/Mail';

class RegistrationController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const registrations = await Registration.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
      limit: 20,
      offset: (page - 1) * 10,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age', 'weight', 'height'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration', 'price'],
        },
      ],
    });

    return res.json(registrations);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

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
    let end_date = '';

    switch (plan.id) {
      case 1:
        price = 129.0;
        end_date = addMonths(parseISO(start_date), 1);
        break;
      case 2:
        price = 387.0;
        end_date = addMonths(parseISO(start_date), 3);
        break;
      case 3:
        price = 774.0;
        end_date = addMonths(parseISO(start_date), 6);
        break;
      default:
        price = 0;
        break;
    }

    if (isBefore(parseISO(start_date), new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    const { id } = await Registration.create({
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });

    await Mail.sendMail({
      to: `${student.name} <${student.email}`,
      subject: 'Matrícula efetuada com sucesso',
      template: 'registration',
      context: {
        name: student.name,
        price: plan.price,
        end_date: format(end_date, "'dia' dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });

    return res.json({
      id,
      student,
      plan,
      start_date,
      end_date,
      price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { id } = req.params;

    const { plan_id } = req.body;

    const plan = await Plan.findOne({ where: { id: plan_id } });

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exist' });
    }

    const registration = await Registration.findByPk(id);

    const { student } = await registration.update(req.body);

    return res.json({
      id,
      student,
      plan,
    });
  }

  async delete(req, res) {
    const { id } = req.params;

    await Registration.destroy({ where: { id } });

    return res.json();
  }
}

export default new RegistrationController();

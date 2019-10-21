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
      offset: (page - 1) * 20,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title'],
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

    const registrationExists = await Registration.findOne({
      where: { student_id },
    });

    if (registrationExists) {
      return res
        .status(400)
        .json({ error: 'Registration with this student already exists' });
    }

    const plan = await Plan.findOne({ where: { id: plan_id } });

    const price = plan.duration * plan.price;
    const end_date = addMonths(parseISO(start_date), plan.duration);

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

    const studentData = await Student.findByPk(student_id);

    await Mail.sendMail({
      to: `${studentData.name} <${studentData.email}`,
      subject: 'Matrícula efetuada com sucesso',
      template: 'registration',
      context: {
        name: studentData.name,
        price: plan.price,
        end_date: format(end_date, "'dia' dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });

    return res.json({
      id,
      student_id,
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
    const { start_date, student_id, plan_id } = req.body;

    const registration = await Registration.findByPk(id);

    if (student_id !== registration.student_id) {
      const registrationExists = await Registration.findOne({
        where: { student_id },
      });

      if (registrationExists) {
        return res
          .status(401)
          .json({ error: 'Registration with this student already exists' });
      }
    }

    const plan = await Plan.findByPk(plan_id);

    let { price, end_date } = registration;

    if (plan_id !== registration.plan_id) {
      price = plan.duration * plan.price;
      end_date = addMonths(parseISO(start_date), plan.duration);
    }

    if (start_date !== registration.start_date) {
      end_date = addMonths(parseISO(start_date), plan.duration);
    }

    registration.update({ student_id, plan_id, start_date, end_date, price });
    registration.save();

    return res.json(registration);
  }

  async delete(req, res) {
    const { id } = req.params;

    await Registration.destroy({ where: { id } });

    return res.json();
  }
}

export default new RegistrationController();

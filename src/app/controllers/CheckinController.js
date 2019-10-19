import { Op } from 'sequelize';
import { startOfWeek, endOfWeek } from 'date-fns';
import Checkin from '../models/Checkin';

class CheckinController {
  async index(req, res) {
    const { id } = req.params;

    const checkins = await Checkin.findAll({ where: { student_id: id } });

    return res.json(checkins);
  }

  async store(req, res) {
    const { id } = req.params;

    const student_id = id;

    const checkins = await Checkin.findAll({
      where: {
        student_id: id,
      },
    });

    const checkinsWeek = {
      [Op.between]: [
        startOfWeek(checkins.createdAt),
        endOfWeek(checkins.createdAt),
      ],
    };

    if (checkinsWeek && checkins.length >= 5) {
      return res.status(400).json({ error: 'Max 5 checkins in 7 days' });
    }

    const checkin = await Checkin.create({
      student_id,
    });

    return res.json(checkin);
  }
}

export default new CheckinController();

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
      where: { student_id: id },
    });

    if (checkins.length >= 5) {
      return res.status(400).json({ error: 'Max 5 checkins in 7 days' });
    }

    // arrumar a validação de 5 x em 7 dias

    const checkin = await Checkin.create({
      student_id,
    });

    return res.json(checkin);
  }
}

export default new CheckinController();

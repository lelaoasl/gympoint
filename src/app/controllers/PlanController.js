import Plan from '../models/Plan';

class PlanController {
  async index(req, res) {
    const plans = await Plan.findAll({});

    return res.json(plans);
  }

  async store(req, res) {
    const { id, title, duration, price } = await Plan.create(req.body);

    console.log(req.body);

    return res.json({
      id,
      title,
      duration,
      price,
    });
  }
}

export default new PlanController();

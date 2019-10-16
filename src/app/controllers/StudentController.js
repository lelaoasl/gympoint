import Student from '../models/Student';
import User from '../models/User';

class StudentController {
  async store(req, res) {
    const user = await User.findByPk(req.userId);

    if (!user) {
      return res.status(400).json({ error: 'User does not have permission' });
    }

    const { id, name, email, age, height, weight } = await Student.create(
      req.body
    );

    return res.json({ id, name, email, age, height, weight });
  }
}

export default new StudentController();

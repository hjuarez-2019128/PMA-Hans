// controllers/studentController.js
import Student from './student.model.js';
import Course from '../course/course.model.js';

import { encrypt, checkPassword } from '../utils/validator.js'
import { generateJwt } from '../utils/jwt.js'

// Registrar un nuevo estudiante

export const registerStudent = async (req, res) => {
  try {
      // Capturar el formulario (body)
      let data = req.body;
      // Encriptar la contraseña
      data.password = await encrypt(data.password);
      // Asignar el rol de estudiante
      data.role = 'STUDENT_ROLE';
      // Guardar la información en la BD
      let student = new Student(data);
      await student.save(); // Guardar en la BD
      // Responder al usuario
      return res.send({ message: `Registered successfully, can log in with username ${student.username}` });
  } catch (err) {
      console.error(err);
      return res.status(500).send({ message: 'Error registering student', error: err });
  }
};

export const loginStudent = async (req, res) => {
  try {
      // Capturar los datos del cuerpo de la solicitud
      let { username, password } = req.body;
      // Validar que el estudiante exista
      let student = await Student.findOne({ username }); // Buscar un solo registro
      // Verificar que la contraseña coincida
      if (student && await checkPassword(password, student.password)) {
          let loggedStudent = {
              uid: student._id,
              username: student.username,
              role: student.role,
            
          };
          // Generar el Token JWT
          let token = await generateJwt(loggedStudent);
          // Responder al estudiante
          return res.send({
              message: `Welcome ${loggedStudent.username}`,
              loggedStudent,
              token
          });
      }
      return res.status(404).send({ message: 'Invalid credentials' });
  } catch (err) {
      console.error(err);
      return res.status(500).send({ message: 'Error to login' });
  }
};


// Editar el perfil de un estudiante
export const editProfile = async (req, res) => {
  try {
    const { username, password } = req.body;
    const studentId = req.params.studentId;
    const student = await Student.findByIdAndUpdate(studentId, { username, password }, { new: true });
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado.' });
    }
    res.json({ message: 'Perfil de estudiante actualizado correctamente.', student });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar el perfil de un estudiante
export const deleteProfile = async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const student = await Student.findByIdAndDelete(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Estudiante no encontrado.' });
    }
    res.json({ message: 'Perfil de estudiante eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


export const assignCourse = async (req, res) => {
  try {
    const { courses } = req.body;
    const studentId = req.user.id; // Se obtiene el ID del estudiante desde el token

    // Verificar si el estudiante existe
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).send({ message: 'Estudiante no encontrado.' });
    }

    // Verificar si el estudiante ya está asignado a 3 cursos
    if (courses.length > 3) {
      return res.status(400).send({ message: 'El estudiante no puede asignarse a más de 3 cursos.' });
    }

    // Verificar si alguno de los cursos ya está asignado al estudiante
    const assignedCourses = await Course.find({ _id: { $in: courses }, students: studentId });
    if (assignedCourses.length > 0) {
      return res.status(400).send({ message: 'El estudiante ya está asignado a uno o más de los cursos seleccionados.' });
    }

    // Actualizar los cursos asignados al estudiante
    student.courses = courses;
    await student.save();

    res.json({ message: 'Perfil de estudiante actualizado correctamente.', student });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
export const getCoursesForStudent = async (req, res) => {
  try {
    const student = req.user; // Obtenemos al estudiante desde el middleware validateJwt

    // Obtenemos los cursos asignados al estudiante
    const courses = await Course.find({ students: student._id });

    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// routers/studentRouter.js

import express from 'express'
import {validateJwt} from '../middlewares/validate-jwt.js'
import {loginStudent , assignCourse, deleteProfile, editProfile, registerStudent, getCoursesForStudent} from './student.controller.js'
const api = express.Router();

api.post('/Studentregister',registerStudent);
api.post('/Login',loginStudent );


api.put('/:studentId/edit', editProfile);
api.delete('/:studentId/delete', deleteProfile);
api.post('/assign', validateJwt, assignCourse)
api.get('/courses',validateJwt, getCoursesForStudent)


export default api

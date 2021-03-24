import { Request, response, Response } from "express";
import { resolve } from 'path';
import { getCustomRepository } from "typeorm";
import { SurveysRepository } from "../repositories/SurveysRepository";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";
import { UsersRepository } from "../repositories/UsersRepository";
import sendMailService from '../services/sendMailService';

class SendMailController {
    async execute(req: Request, res: Response) {
        const { email, survey_id } = req.body;

        const usersRepository = getCustomRepository(UsersRepository);
        const surveysRepository = getCustomRepository(SurveysRepository);
        const surveysUsersRepository = getCustomRepository(SurveysUsersRepository);

        const user = await usersRepository.findOne({ email });

        if (!user) {
            return res.status(400).json({
                error: "User does not exists",
            });
        }

        const survey = await surveysRepository.findOne({ id: survey_id })

        if (!survey) {
            return res.status(400).json({
                error: "Survey does not exists",
            });
        }

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

        //  where: [{ user_id: user.id }, { value: null }], conditional 'or'
        //  where: [{ user_id: user.id, value: null }], conditional 'and'
        const surveyUserAlreadyExists = await surveysUsersRepository.findOne({
            where: [{ user_id: user.id, survey_id: survey.id }],
            relations: ["user", "survey"]
        });

        const variables = {
            name: user.name,
            title: survey.title,
            description: survey.description,
            id: "",
            link: process.env.URL_MAIL
        }

        if(surveyUserAlreadyExists !== undefined && surveyUserAlreadyExists.value === null) {
            variables.id = surveyUserAlreadyExists.id
            await sendMailService.execute(email, survey.title, variables, npsPath);
            return res.json(surveyUserAlreadyExists);
        } else if (surveyUserAlreadyExists !== undefined && surveyUserAlreadyExists.value !== null) {
            return res.json({message: "Completed survey", surveyUserAlreadyExists});
        }

        // Salvando as informações no banco de dados surveyUser
        const surveyUser = surveysUsersRepository.create({
            user_id: user.id,
            survey_id,
        });

        await surveysUsersRepository.save(surveyUser);

        // Enviando e-mail para o usuário
        variables.id = surveyUser.id
        await sendMailService.execute(email, survey.title, variables, npsPath);

        return res.json(surveyUser);
    }
}

export { SendMailController };


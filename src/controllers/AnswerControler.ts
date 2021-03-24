import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/AppError";
import { SurveysUsersRepository } from "../repositories/SurveysUsersRepository";

class AnswerController {
    async execute(req: Request, res: Response) {
        const {value} = req.params;
        const {u} = req.query;

        const surveyUsersRepository = getCustomRepository(SurveysUsersRepository);

        const surveyUser = await surveyUsersRepository.findOne({
            id: String(u)
        });

        if(!surveyUser) {
            throw new AppError("Survey user does not exists!");
            // throw new AppError("Survey user does not exists!", 400);
            // return res.status(400).json({
            //     error: "Survey user does not exists!"
            // });
        }

        if(surveyUser.value !== null) {
            return res.status(200).json({
                message: "Survey completed"
            });
        }

        surveyUser.value = Number(value);

        await surveyUsersRepository.save(surveyUser);

        return res.json(surveyUser);
    }
}

export {AnswerController}
import { Request, Response } from "express";
import { getCustomRepository } from "typeorm";
import { UsersRepository } from "../repositories/UsersRepository";
import * as yup from 'yup';
import { AppError } from "../errors/AppError";

class UserController {
    async create(req: Request, res: Response) {
        const {name, email} = req.body;

        const schema = yup.object().shape({
            name: yup.string().required('Nome obrigatório'),
            email: yup.string().email('Email inválido').required(),
        });

        // if(!(await schema.isValid(req.body))) {
        //     return res.status(400).json({error: "Validation failed!"})
        // }

        try {
            await schema.validate(req.body, {abortEarly: false})
        } catch (error) {
            throw new AppError(error);
            // return res.status(400).json({error})
        }

        const usersRepository = getCustomRepository(UsersRepository);

        const userAlreadyExists = await usersRepository.findOne({
            email
        });

        if(userAlreadyExists) {
            throw new AppError("User already exists");
            // return res.status(400).json({
            //     error: "User already exists",
            // });
        }

        const user = usersRepository.create({
            name,
            email
        });

        await usersRepository.save(user);

        return res.status(201).json(user);
    }
}

export { UserController };

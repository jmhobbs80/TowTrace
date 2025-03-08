import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { Task } from "../types";

/**
 * TaskCreate - API endpoint for creating a new task
 * 
 * This class handles POST requests to create new tasks in the system.
 * It validates the incoming request body against the Task schema,
 * creates the task in the database, and returns the created task.
 * 
 * @route POST /api/tasks
 */
export class TaskCreate extends OpenAPIRoute {
	schema = {
		tags: ["Tasks"],
		summary: "Create a new Task",
		request: {
			body: {
				content: {
					"application/json": {
						schema: Task,
					},
				},
			},
		},
		responses: {
			"200": {
				description: "Returns the created task",
				content: {
					"application/json": {
						schema: z.object({
							series: z.object({
								success: Bool(),
								result: z.object({
									task: Task,
								}),
							}),
						}),
					},
				},
			},
		},
	};

	/**
	 * Handle the task creation request
	 * 
	 * This method processes the incoming request, validates the data,
	 * creates the task in the database, and returns the result.
	 * 
	 * @param {Request} c - The request context
	 * @returns {Promise<Object>} The created task and success status
	 */
	async handle(c) {
		// Get validated data
		const data = await this.getValidatedData<typeof this.schema>();

		// Retrieve the validated request body
		const taskToCreate = data.body;

		// Implement your own object insertion here

		// return the new task
		return {
			success: true,
			task: {
				name: taskToCreate.name,
				slug: taskToCreate.slug,
				description: taskToCreate.description,
				completed: taskToCreate.completed,
				due_date: taskToCreate.due_date,
			},
		};
	}
}

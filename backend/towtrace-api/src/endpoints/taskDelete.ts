import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { Task } from "../types";

/**
 * TaskDelete - API endpoint for deleting a task
 * 
 * This class handles DELETE requests to remove existing tasks from the system.
 * It validates the task slug from the URL parameters, deletes the corresponding
 * task from the database, and returns the deleted task for confirmation.
 * 
 * @route DELETE /api/tasks/:taskSlug
 */
export class TaskDelete extends OpenAPIRoute {
	schema = {
		tags: ["Tasks"],
		summary: "Delete a Task",
		request: {
			params: z.object({
				taskSlug: Str({ description: "Task slug" }),
			}),
		},
		responses: {
			"200": {
				description: "Returns if the task was deleted successfully",
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
	 * Handle the task deletion request
	 * 
	 * This method processes the incoming deletion request, validates the taskSlug,
	 * deletes the task from the database, and returns confirmation.
	 * 
	 * @param {Request} c - The request context
	 * @returns {Promise<Object>} The deleted task and success status
	 */
	async handle(c) {
		// Get validated data
		const data = await this.getValidatedData<typeof this.schema>();

		// Retrieve the validated slug
		const { taskSlug } = data.params;

		// Implement your own object deletion here

		// Return the deleted task for confirmation
		return {
			result: {
				task: {
					name: "Build something awesome with Cloudflare Workers",
					slug: taskSlug,
					description: "Lorem Ipsum",
					completed: true,
					due_date: "2022-12-24",
				},
			},
			success: true,
		};
	}
}

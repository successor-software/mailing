import type { User } from "prisma/generated/client";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../prisma";
import { withSessionAPIRoute } from "src/util/session";
import { validate, validationErrorResponse } from "../../../util/api/validate";
import { error } from "../../../util/log";

interface Data {
  error?: string;
  list?: any;
  lists?: any;
}

async function handleGetLists(
  user: User,
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const lists = await prisma.list.findMany({
    where: { organizationId: user.organizationId },
  });
  return res.json({ lists });
}

async function handleCreateList(
  user: User,
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // validate name presence
  const { name } = req.body;

  if (name) {
    try {
      // capitalize the first letter of the list name
      const displayName = name.charAt(0).toUpperCase() + name.slice(1);

      const list = await prisma.list.create({
        data: {
          name,
          displayName,
          organizationId: user.organizationId,
          isDefault: false,
        },
      });
      return res.status(201).json({ list });
    } catch (e) {
      // the unique constraint on name might have failed
      error(e);
      return res.status(500);
    }
  } else {
    return res.status(422).json({ error: "name is required" });
  }
}

const ApiLists = withSessionAPIRoute(async function (
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const validatedRequest = validate(req, { loggedIn: true });

  if (validatedRequest.hasError)
    return validationErrorResponse(validatedRequest, res);

  const { user } = validatedRequest.validated;

  switch (req.method) {
    case "GET":
      handleGetLists(user, req, res);
      break;
    case "POST":
      handleCreateList(user, req, res);
      break;
    default:
      return res.status(404).end();
  }
});

export default ApiLists;

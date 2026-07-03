import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { randomUUID } from "crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fileName, fileType } = body;

    if (!fileName || !fileType) {
      return Response.json({
        success: false,
        message: "fileName and fileType are required",
      });
    }

    // Unique key so files never overwrite each other
    const key = `uploads/${session.user.organizationId}/${randomUUID()}-${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: key,
      ContentType: fileType,
    });

    // URL valid for 60 seconds — enough time for the client to upload
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 60 });

    const publicUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return Response.json({
      success: true,
      uploadUrl,
      publicUrl,
    });
  } catch (error) {
    console.log(error);
    return Response.json({
      success: false,
      message: "Internal Server Error",
    });
  }
}
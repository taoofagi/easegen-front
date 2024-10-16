// index.ts
import request from "@/config/axios";

export const generateToken = async() => {
  return await request.post({ url: '/digitalcourse/course-ppts/generateToken' })
}


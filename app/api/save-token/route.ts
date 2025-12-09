import { NextRequest, NextResponse } from "next/server";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

// Đường dẫn đến file lưu tokens
const TOKENS_FILE = path.join(process.cwd(), "tokens.json");

interface TokenData {
  token: string;
  timestamp: string;
  userAgent?: string;
}

// Đảm bảo file tokens.json tồn tại
async function ensureTokensFile() {
  if (!existsSync(TOKENS_FILE)) {
    await writeFile(TOKENS_FILE, JSON.stringify([], null, 2), "utf-8");
  }
}

// Đọc danh sách tokens
async function readTokens(): Promise<TokenData[]> {
  await ensureTokensFile();
  try {
    const content = await readFile(TOKENS_FILE, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

// Lưu token mới
export async function POST(request: NextRequest) {
  try {
    const { token, userAgent } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: "Token is required" },
        { status: 400 }
      );
    }

    const tokens = await readTokens();

    // Kiểm tra xem token đã tồn tại chưa
    const existingTokenIndex = tokens.findIndex((t) => t.token === token);

    const tokenData: TokenData = {
      token,
      timestamp: new Date().toISOString(),
      userAgent: userAgent || request.headers.get("user-agent") || undefined,
    };

    if (existingTokenIndex >= 0) {
      // Cập nhật timestamp nếu token đã tồn tại
      tokens[existingTokenIndex] = tokenData;
    } else {
      // Thêm token mới
      tokens.push(tokenData);
    }

    // Lưu vào file
    await writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2), "utf-8");

    return NextResponse.json({
      success: true,
      message: "Token saved successfully",
    });
  } catch (error: any) {
    console.error("Error saving token:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Lấy danh sách tokens
export async function GET() {
  try {
    const tokens = await readTokens();
    return NextResponse.json({ success: true, tokens });
  } catch (error: any) {
    console.error("Error reading tokens:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}


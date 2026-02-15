// まずexpressを使えるようにしましょう！
const express = require("express");
const cors = require("cors");
// → CORS: 異なるドメイン間の通信を許可
//   Next.js（localhost:3000）からAPI（localhost:5000）にアクセスできるようにする

const { PrismaClient } = require("./generated/prisma");
// → Prisma Client: データベースを操作するためのクラス
//   prisma.post.findMany() などでCRUD操作ができる

// ここで実行をして、appの箱の中にexpressの機能を使えるようにしています🤗
const app = express();
const PORT = 8888;

const prisma = new PrismaClient();
// → Prisma Client のインスタンスを作成
//   この prisma を使ってDBを操作する

// ========================================
// ミドルウェアの設定
// ========================================
// ミドルウェア = リクエストを処理する前に実行される関数
// 全てのリクエストに対して共通の処理を行う

app.use(cors());
// → CORS を許可
//   これがないと Next.js から API にアクセスできない

app.use(express.json());
// → JSON リクエストを解析
//   req.body でJSONデータを受け取れるようにする

//1.ここから簡単なAPIを作ります🤗
app.get("/", (req, res) => {
  //resはresponse返答します！の意味です🤗
  res.send("<h1>SNS API Server is running!</h1>");
});

// ここからAPIを開発する流れをイメージしてもらいます🤗
app.post("/api/posts", async (req, res) => {
  try {
    // ここで送られたデータを受け取ります
    const { content, imageUrl, userId } = req.body;
    // req.body = データの塊でAPIでデータが送られる場所になっています🤗そこから分割代入というjsのテクニックを使って抜き出しています🤗

    // バリデーションのチェックをします！本当に送られてるの？？大丈夫？？ってものです🤗

    if (!content || content.trim() === "") {
      // エラーを通知させます！そしてその結果をresponseとして返却しています🤗
      return res.status(400).json({
        error: "投稿の中身が空なので入力してください",
      });
    }

    // 登録の処理の場所です🤗prismaを使ってデータを実際に登録するフェースです🤗
    const post = await prisma.post.create({
      // prismaの公式のお作法になっています🤗難しく考えないでください🤗
      data: {
        content: content.trim(),
        imageUrl: imageUrl || null,
        userId: userId || null,
      },
    });

    // この形式をDBに登録した後に成功したという結果をstatusでお知らせとデータを戻してくれる🤗
    res.status(201).json(post);
  } catch (error) {
    // エラーの書き方は変わりませんのでテンプレと思ってください🤗
    console.error("Error creating post:", error);
    res.status(500).json({ error: "投稿の作成に失敗しました" });
  }

// この下は消さない
});

// 宿題で追加
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ error: "投稿の取得に失敗しました" });
  }
});

// 宿題で追加
app.delete("/api/posts/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    const deleted = await prisma.post.delete({ where: { id } });

    res.json(deleted); // 期待が「削除した投稿を返す」ならこれでOK
    // 期待が「空でOK」なら: res.status(204).end();
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ error: "投稿の削除に失敗しました" });
  }
});

// ここでサーバーを起動させます🤗 listenがないと動きません！これでアクセスをしたらサーバーが動きます🤗
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
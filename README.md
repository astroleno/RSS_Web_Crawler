This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 环境配置

为确保项目在不同环境中正常运行，请注意：

1. 复制 `.env.local.example` 到 `.env.local` 并填写必要的环境变量
2. 确保所有依赖已正确安装：   ```bash
   npm install
   # 或
   yarn install   ```
3. 项目使用相对路径引用，确保可以在不同环境中正常运行
4. 如果遇到路径相关错误，请检查：
   - node_modules 是否完整安装
   - .env.local 文件是否正确配置
   - 是否执行了 build 命令

## 常见问题解决

如果遇到环境依赖报错：
1. 删除 node_modules 文件夹和 package-lock.json
2. 重新执行 npm install
3. 确保 .env.local 文件存在并包含必要的环境变量

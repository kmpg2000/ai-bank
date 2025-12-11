<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# AI-Bank - AI App Library

ローカルでの実行方法とデプロイ手順について説明します。

## ローカルでの実行

**前提条件:** Node.js (v18 以降を推奨)

1. **依存パッケージのインストール:**
   ```bash
   npm install
   ```

2. **環境変数の設定:**
   ルートディレクトリに `.env.local` というファイルを作成し、Gemini APIキーを追加してください:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **アプリの起動:**
   ```bash
   npm run dev
   ```
   ブラウザで http://localhost:3000 を開いて確認してください。

---

## ビルドとデプロイ

このプロジェクトは Vite を使用しており、任意の静的ホスティングサービスにデプロイ可能です。

### オプション 1: Vercel (推奨)

1. **コードを GitHub/GitLab/Bitbucket にプッシュします。**
2. **Vercel にログイン**し、"Add New..." > "Project" をクリックします。
3. **リポジトリをインポート**します。
4. **プロジェクトの設定:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **環境変数の設定 (重要):**
   - "Environment Variables" セクションを展開します。
   - Key: `GEMINI_API_KEY`
   - Value: `あなたのGemini APIキー`
6. **Deploy** をクリックします。

### オプション 2: Netlify

1. **コードを Git にプッシュします。**
2. **Netlify にログイン**し、"Add new site" > "Import an existing project" をクリックします。
3. **Gitプロバイダーと連携**し、リポジトリを選択します。
4. **ビルド設定:**
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **環境変数の設定:**
   - "Show advanced" をクリックするか、サイト作成後に "Site settings" > "Environment variables" に移動します。
   - Key: `GEMINI_API_KEY`
   - Value: `あなたのGemini APIキー`
6. **Deploy site** をクリックします。

### オプション 3: 手動ビルド (静的ホスティング)

1. ローカルでビルドコマンドを実行します:
   ```bash
   npm run build
   ```
2. `dist` フォルダが作成されます。
3. `dist` フォルダの中身を任意の Web サーバーやホスティングプロバイダー (FTP, AWS S3, Firebase Hosting など) にアップロードしてください。

> **注意:** このアプリはクライアントサイドで API キーを使用するため、公開環境にデプロイする際は、Google Cloud Console で API キーに適切な制限 (HTTP リファラー制限など) を設定し、不正利用を防止することを強く推奨します。
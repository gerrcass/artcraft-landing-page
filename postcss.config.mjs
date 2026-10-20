const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ""

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "./postcss-prefix-asset-paths.cjs": { basePath },
  },
}

export default config

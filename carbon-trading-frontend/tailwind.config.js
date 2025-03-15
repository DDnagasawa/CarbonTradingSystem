/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      "./src/**/*.{js,jsx,ts,tsx}" // 指定 React 项目的文件路径
    ],
    theme: {
      extend: {}, // 可根据需要自定义主题
    },
    plugins: [], // 如果需要添加插件，可以在这里配置
  };
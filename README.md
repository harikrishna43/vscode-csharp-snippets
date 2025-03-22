# C# File Generator - VS Code Extension

![C# File Generator](https://img.shields.io/badge/VSCode-Extension-blue.svg)

A powerful **Visual Studio Code** extension that allows you to quickly generate **C# files** with predefined templates, ensuring consistent structure and reducing repetitive work.

## ✨ Features
- Automatically generates **C# Classes, Interfaces, Controllers, DTOs, Enums, Services, Razor Views**, and more.
- Ensures **consistent file naming** and **namespace generation**.
- **Prevents duplicate files** and handles missing extensions.
- Provides a **Quick Pick menu** to select the file type when creating a new file.
- **Supports custom templates** via `settings.json`.

## 📌 Installation
1. Open **VS Code**.
2. Go to **Extensions** (`Ctrl+Shift+X` / `Cmd+Shift+X` on macOS).
3. Search for **C# File Generator**.
4. Click **Install**.

## 🚀 Usage
1. **Create a new file** in your project (e.g., `UserService`).
2. If no extension is provided, the extension prompts you to select one (`.cs`, `.cshtml`, `.json`, etc.).
3. Choose the **file type** (Class, Interface, Controller, etc.).
4. The extension generates the correct **file structure** and **opens the file** in the editor.

## ⚙️ Configuration (Custom Templates)
You can **customize templates** by modifying your **VS Code settings**:

1. Open **Settings** (`Ctrl+,` / `Cmd+,` on macOS).
2. Search for `csharpTemplates`.
3. Modify or add custom **file templates** in `settings.json`:

```json
"csharpTemplates.templates": {
    "CustomType": "using System;\n\nnamespace {{NAMESPACE}}\n{\n    public class {{NAME}} { }\n}"
}
```

## 📂 File Naming Rules
- **Classes** → `UserService.cs`
- **Interfaces** → `IUserService.cs`
- **Controllers** → `UserController.cs`
- **DTOs** → `UserDto.cs`
- **Services** → `UserService.cs`
- **Enums** → `UserType.cs`
- **Razor Views** → `Index.cshtml`

## ❗ Known Issues
- If a file is mistakenly created **without an extension**, the extension will automatically **delete** it and create the correct version.

## 🛠️ Contributing
1. Fork this repository.
2. Create a new branch (`feature/new-feature`).
3. Commit your changes.
4. Push to the branch and create a **Pull Request**.

## 📄 License
This extension is **open-source** and licensed under the **MIT License**.

---
📢 **Feedback & Issues?** Feel free to [open an issue](https://github.com/your-repo/vscode-csharp-file-generator/issues)! 🚀


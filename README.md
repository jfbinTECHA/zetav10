# Zeta AI Dashboard

A real-time command center for monitoring AI agents and managing tasks with advanced filtering, notifications, and panic mode capabilities.

![Dashboard Preview](./public/screenshot.png)

## 🚀 Features

- **Real-time Agent Monitoring**: Live status updates for Chrono, Vega, Aria, and Kilo Code agents
- **Advanced Task Management**: Priority-based task filtering (High ⚡, Medium 🛠, Low 💤)
- **Interactive Filters**: Filter by agent, priority, and keyword search
- **Smart Notifications**: Toast notifications and sound alerts for high-priority tasks
- **Panic Mode**: Flashing alerts and continuous sound for critical situations
- **Task Acknowledgment**: Mark tasks as handled to reduce visual clutter
- **Responsive Design**: Built with Tailwind CSS for modern, mobile-friendly interface
- **Mission Control**: Centralized view of agent activity and system status

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **State Management**: React Context API
- **Notifications**: React Hot Toast
- **Icons**: Emoji-based UI elements
- **Build Tool**: Next.js with automatic optimization

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/jfbinTECHA/zetav10.git
cd zetav10
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🎯 Usage

### Basic Operation
- View real-time agent status and task activity
- Use filters to focus on specific agents or priority levels
- Toggle highlight-only mode to reduce clutter
- Activate panic mode for critical situations

### Task Management
- High-priority tasks trigger notifications and sound alerts
- Click acknowledge buttons to mark tasks as handled
- Panic mode continues until all high-priority tasks are acknowledged

### Customization
- Update agent configurations in `components/AgentCard.js`
- Modify notification sounds in `public/alert.mp3`
- Customize styling in Tailwind CSS classes

## 📁 Project Structure

```
zeta-ai-dashboard/
├── components/
│   ├── AgentCard.js          # Individual agent status component
│   ├── Dashboard.js          # Main dashboard layout
│   ├── HelpPanel.js          # Help and documentation panel
│   ├── LogsContext.js        # Global logs state management
│   ├── LogsPanel.js          # Logs display component
│   ├── MissionControl.js     # Central command interface
│   └── _app.js               # Next.js app wrapper
├── pages/
│   ├── _app.js               # Next.js app configuration
│   └── index.js              # Main dashboard page
├── public/
│   ├── alert.mp3             # Notification sound file
│   └── ZetaManual.zip        # Documentation package
├── styles/
│   └── globals.css           # Global CSS styles
├── ZetaManual/               # Complete documentation package
│   ├── index.html            # HTML manual
│   ├── images/               # Screenshots and assets
│   ├── build_manual.sh       # Linux/macOS PDF generator
│   ├── build_manual.ps1      # Windows PDF generator
│   └── README.txt            # Documentation instructions
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
└── README.md                 # This file
```

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for custom configurations:

```env
NEXT_PUBLIC_APP_NAME=Zeta AI Dashboard
NEXT_PUBLIC_VERSION=1.0.0
```

### Agent Configuration
Modify agent settings in `components/AgentCard.js`:

```javascript
const taskPool = {
  Chrono: [
    { message: "Custom task", priority: "high" }
  ]
};
```

## 📚 Documentation

Complete user manual available in `ZetaManual/` folder:

- **HTML Manual**: Open `ZetaManual/index.html` in browser
- **PDF Generation**: Run `./ZetaManual/build_manual.sh` (Linux/macOS) or `.\ZetaManual\build_manual.ps1` (Windows)
- **Instructions**: See `ZetaManual/README.txt`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with Next.js and Tailwind CSS
- Icons and emojis for modern UI
- React Hot Toast for notifications
- Inspired by real-time monitoring systems

## 📞 Support

For support or questions:
- Create an issue on GitHub
- Check the documentation in `ZetaManual/`
- Email: support@zeta-ai.com

---

**Version 1.0.0** | Built with ❤️ for AI agent monitoring
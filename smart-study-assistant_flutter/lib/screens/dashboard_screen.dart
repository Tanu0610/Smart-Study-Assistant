import 'package:flutter/material';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';
import 'login_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _formKey = GlobalKey<FormState>();
  final _subjectController = TextEditingController();
  final _topicController = TextEditingController();
  final _durationController = TextEditingController(text: '4 hours');
  final _examTypeController = TextEditingController(text: 'Semester Exam');
  
  String _username = 'Student';
  bool _loading = false;
  String? _error;
  Map<String, dynamic>? _generatedPackage;

  @override
  void initState() {
    super.initState();
    _loadUserInfo();
  }

  void _loadUserInfo() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _username = prefs.getString('username') ?? 'Student';
    });
  }

  void _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => const LoginScreen()),
      );
    }
  }

  void _openSettings() async {
    final prefs = await SharedPreferences.getInstance();
    final keyController = TextEditingController(text: prefs.getString('gemini_api_key') ?? '');
    
    if (!mounted) return;
    showDialog(
      context: context,
      builder: (context) {
        final theme = Theme.of(context);
        return AlertDialog(
          backgroundColor: theme.cardColor,
          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
          title: const Text('API CONSOLE SETTINGS', style: TextStyle(fontSize: 14, fontFamily: 'monospace')),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: keyController,
                obscureText: true,
                decoration: const InputDecoration(
                  labelText: 'Custom Gemini API Key',
                  hintText: 'AIzaSy...',
                ),
              ),
              const SizedBox(height: 12),
              const Text(
                'Saves locally on this device. Attaches to all backend study generation calls.',
                style: TextStyle(fontSize: 10, color: Colors.grey),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('CANCEL', style: TextStyle(color: Colors.grey)),
            ),
            TextButton(
              onPressed: () async {
                await prefs.setString('gemini_api_key', keyController.text.trim());
                if (mounted) Navigator.pop(context);
              },
              child: Text('APPLY', style: TextStyle(color: theme.colorScheme.primary)),
            ),
          ],
        );
      },
    );
  }

  void _generate() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
      _generatedPackage = null;
    });

    try {
      final data = await ApiService.generateStudyPackage(
        subject: _subjectController.text,
        topic: _topicController.text,
        duration: _durationController.text,
        examType: _examTypeController.text,
      );
      setState(() {
        _generatedPackage = data;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceFirst('Exception: ', '');
      });
    } finally {
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.black,
        title: const Text('STUDY CONSOLE', style: TextStyle(fontSize: 14, fontFamily: 'monospace', letterSpacing: 1)),
        actions: [
          IconButton(
            icon: const Icon(Icons.settings),
            onPressed: _openSettings,
            tooltip: 'API Keys Settings',
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
            tooltip: 'Log Out',
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // WELCOME BANNER
            Container(
              padding: const EdgeInsets.all(16),
              color: theme.cardColor,
              child: Row(
                children: [
                  Icon(Icons.account_circle, size: 40, color: theme.colorScheme.primary),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Welcome, $_username', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                      const Text('Ready to generate standard exam prep kits.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // GENERATION FORM
            Form(
              key: _formKey,
              child: Card(
                color: theme.cardColor,
                shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text(
                        'TOPIC PREPARATION INPUTS',
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1),
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _subjectController,
                        decoration: const InputDecoration(labelText: 'Subject (e.g. Computer Science)'),
                      ),
                      const SizedBox(height: 12),
                      TextFormField(
                        controller: _topicController,
                        decoration: const InputDecoration(labelText: 'Topic to master *'),
                        validator: (value) => value == null || value.trim().isEmpty ? 'Topic required' : null,
                      ),
                      const SizedBox(height: 12),
                      Row(
                        children: [
                          Expanded(
                            child: TextFormField(
                              controller: _durationController,
                              decoration: const InputDecoration(labelText: 'Duration (hours)'),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: TextFormField(
                              controller: _examTypeController,
                              decoration: const InputDecoration(labelText: 'Exam Target'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 20),
                      ElevatedButton.icon(
                        onPressed: _loading ? null : _generate,
                        icon: const Icon(Icons.bolt),
                        label: const Text('GENERATE STUDY KIT', style: TextStyle(fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: theme.colorScheme.primary,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            if (_loading) ...[
              const SizedBox(height: 32),
              const Center(child: CircularProgressIndicator()),
            ],
            if (_error != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                color: Colors.red.withOpacity(0.15),
                border: Border.all(color: Colors.redAccent),
                child: Text(_error!, style: const TextStyle(color: Colors.redAccent, fontSize: 12)),
              ),
            ],
            // SHOW GENERATED GUIDE
            if (_generatedPackage != null) ...[
              const SizedBox(height: 24),
              const Text(
                'GENERATED PREP DATA',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, letterSpacing: 1),
              ),
              const SizedBox(height: 8),
              Card(
                color: Colors.black,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.zero,
                  side: BorderSide(color: theme.colorScheme.primary),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _generatedPackage!['topic'] ?? 'Study Topic Guide',
                        style: TextStyle(fontSize: 18, color: theme.colorScheme.primary, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 12),
                      const Text('Explanation', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.blueAccent)),
                      const SizedBox(height: 4),
                      Text(_generatedPackage!['simple_explanation'] ?? 'N/A', style: const TextStyle(height: 1.4)),
                      if (_generatedPackage!['tamil_explanation'] != null) ...[
                        const SizedBox(height: 12),
                        const Text('Vernacular Summary (Tamil)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.emeraldAccent)),
                        const SizedBox(height: 4),
                        Text(_generatedPackage!['tamil_explanation'] ?? '', style: const TextStyle(height: 1.4)),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

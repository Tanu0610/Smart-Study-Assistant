import 'package:flutter/material';
import 'package:shared_preferences/shared_preferences.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _apiKeyController = TextEditingController();
  bool _isLogin = true;
  bool _loading = false;
  String? _errorMessage;

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _errorMessage = null;
    });

    try {
      final prefs = await SharedPreferences.getInstance();
      if (_isLogin) {
        // Mock authentication delay
        await Future.delayed(const Duration(seconds: 1));
        await prefs.setBool('user_logged_in', true);
        await prefs.setString('username', _usernameController.text);
        if (_apiKeyController.text.isNotEmpty) {
          await prefs.setString('gemini_api_key', _apiKeyController.text.trim());
        }
        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => const DashboardScreen()),
          );
        }
      } else {
        await Future.delayed(const Duration(milliseconds: 500));
        setState(() {
          _isLogin = true;
          _passwordController.clear();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Account created! Please sign in.')),
          );
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'An error occurred. Please try again.';
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
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 400),
            decoration: BoxDecoration(
              color: theme.cardColor,
              border: Border.all(color: theme.colorScheme.primary, width: 2.0),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // LOGO / TITLE HEADER
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(vertical: 24.0),
                  color: Colors.black.withOpacity(0.4),
                  child: Column(
                    children: [
                      Icon(Icons.school, size: 48, color: theme.colorScheme.primary),
                      const SizedBox(height: 12),
                      Text(
                        'SMART STUDY ASSISTANT',
                        style: theme.textTheme.titleLarge?.copyWith(fontSize: 18),
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'FLUTTER MOBILE CLIENT',
                        style: TextStyle(
                          fontSize: 10,
                          fontFamily: 'monospace',
                          color: Colors.grey,
                          letterSpacing: 2,
                        ),
                      ),
                    ],
                  ),
                ),
                // TABS
                Row(
                  children: [
                    Expanded(
                      child: TextButton(
                        onPressed: () => setState(() => _isLogin = true),
                        style: TextButton.styleFrom(
                          backgroundColor: _isLogin ? Colors.transparent : Colors.black12,
                          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                        ),
                        child: Text(
                          'SIGN IN',
                          style: TextStyle(
                            color: _isLogin ? theme.colorScheme.primary : Colors.grey,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                    Expanded(
                      child: TextButton(
                        onPressed: () => setState(() => _isLogin = false),
                        style: TextButton.styleFrom(
                          backgroundColor: !_isLogin ? Colors.transparent : Colors.black12,
                          shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                        ),
                        child: Text(
                          'REGISTER',
                          style: TextStyle(
                            color: !_isLogin ? theme.colorScheme.primary : Colors.grey,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 1, color: Colors.grey),
                // FORM
                Padding(
                  padding: const EdgeInsets.all(20.0),
                  child: Form(
                    key: _formKey,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (_errorMessage != null) ...[
                          Container(
                            padding: const EdgeInsets.all(8),
                            color: Colors.red.withOpacity(0.2),
                            child: Text(
                              _errorMessage!,
                              style: const TextStyle(color: Colors.redAccent, fontSize: 12),
                            ),
                          ),
                          const SizedBox(height: 16),
                        ],
                        TextFormField(
                          controller: _usernameController,
                          decoration: const InputDecoration(labelText: 'Username or Email'),
                          validator: (value) => value == null || value.trim().isEmpty ? 'Required' : null,
                        ),
                        const SizedBox(height: 16),
                        TextFormField(
                          controller: _passwordController,
                          obscureText: true,
                          decoration: const InputDecoration(labelText: 'Password'),
                          validator: (value) => value != null && value.length >= 6 ? null : 'Minimum 6 chars',
                        ),
                        if (_isLogin) ...[
                          const SizedBox(height: 16),
                          const Divider(color: Colors.grey),
                          const SizedBox(height: 8),
                          TextFormField(
                            controller: _apiKeyController,
                            decoration: const InputDecoration(
                              labelText: 'Gemini API Key (Optional)',
                              hintText: 'AIzaSy...',
                            ),
                          ),
                          const SizedBox(height: 4),
                          const Text(
                            'Enter your custom API key to authorize LLM query generation.',
                            style: TextStyle(fontSize: 10, color: Colors.grey),
                          ),
                        ],
                        const SizedBox(height: 24),
                        ElevatedButton(
                          onPressed: _loading ? null : _submit,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: theme.colorScheme.primary,
                            foregroundColor: Colors.black,
                            shape: const RoundedRectangleBorder(borderRadius: BorderRadius.zero),
                            padding: const EdgeInsets.symmetric(vertical: 16),
                          ),
                          child: _loading
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.black,
                                  ),
                                )
                              : Text(
                                  _isLogin ? 'PROCEED TO CONSOLE' : 'CREATE ACCOUNT',
                                  style: const TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1),
                                ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

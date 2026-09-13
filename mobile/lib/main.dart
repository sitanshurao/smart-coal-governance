// mobile/lib/main.dart
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() {
  runApp(const CoalSafetyApp());
}

class CoalSafetyApp extends StatelessWidget {
  const CoalSafetyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Coal Mine Safety Reporter',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.blueGrey),
        useMaterial3: true,
      ),
      home: const InspectionFormPage(),
    );
  }
}

class InspectionFormPage extends StatefulWidget {
  const InspectionFormPage({super.key});

  @override
  State<InspectionFormPage> createState() => _InspectionFormPageState();
}

class _InspectionFormPageState extends State<InspectionFormPage> {
  final _formKey = GlobalKey<FormState>();

  // Categories matching the backend AI LabelEncoder
  final List<String> _hazardCategories = [
    'Electrical',
    'Slope Stability',
    'Ventilation',
    'Fire',
    'Machinery'
  ];

  final List<String> _locationZones = [
    'Pit A',
    'Bench 3',
    'Underground Shaft 1',
    'Coal Seam 2',
    'Workshop',
    'Bench 2',
    'Underground Shaft 2'
  ];

  String? _selectedCategory;
  String? _selectedZone;
  final TextEditingController _daysController = TextEditingController(text: "10");
  final TextEditingController _descController = TextEditingController();
  final TextEditingController _latController = TextEditingController(text: "23.7957");
  final TextEditingController _longController = TextEditingController(text: "86.4304");

  bool _isSubmitting = false;

  // Change this URL based on where you run the Flutter app:
  // - Windows App / Chrome: "http://127.0.0.1:8000/inspections/"
  // - Android Emulator: "http://10.0.2.2:8000/inspections/"
  // - Physical Phone: "http://<YOUR_PC_LOCAL_IP>:8000/inspections/"
  final String _apiUrl = "http://127.0.0.1:8000/inspections/";

  Future<void> _submitInspection() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
    });

    final payload = {
      "inspector_id": 1,
      "hazard_category": _selectedCategory,
      "location_zone": _selectedZone,
      "days_since_last_check": int.parse(_daysController.text),
      "description": _descController.text,
      "latitude": double.parse(_latController.text),
      "longitude": double.parse(_longController.text)
    };

    try {
      final response = await http.post(
        Uri.parse(_apiUrl),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(payload),
      );

      setState(() {
        _isSubmitting = false;
      });

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _showResultDialog(
          title: "Submission Successful",
          content: "Hazard Logged with ID: ${data['id']}\nAI Predicted Severity: ${data['severity']}",
          isError: false,
        );
        _descController.clear();
      } else {
        _showResultDialog(
          title: "Submission Failed",
          content: "Server returned status code: ${response.statusCode}",
          isError: true,
        );
      }
    } catch (e) {
      setState(() {
        _isSubmitting = false;
      });
      _showResultDialog(
        title: "Connection Error",
        content: "Could not reach backend: $e",
        isError: true,
      );
    }
  }

  void _showResultDialog({required String title, required String content, required bool isError}) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(title, style: TextStyle(color: isError ? Colors.red : Colors.green[800])),
        content: Text(content),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text("OK"),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Field Hazard Inspection'),
        backgroundColor: Colors.blueGrey[800],
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Hazard Category',
                  border: OutlineInputBorder(),
                ),
                initialValue: _selectedCategory,
                items: _hazardCategories.map((cat) {
                  return DropdownMenuItem(value: cat, child: Text(cat));
                }).toList(),
                onChanged: (val) => setState(() => _selectedCategory = val),
                validator: (val) => val == null ? 'Please select category' : null,
              ),
              const SizedBox(height: 16),
              DropdownButtonFormField<String>(
                decoration: const InputDecoration(
                  labelText: 'Location Zone',
                  border: OutlineInputBorder(),
                ),
                initialValue: _selectedZone,
                items: _locationZones.map((zone) {
                  return DropdownMenuItem(value: zone, child: Text(zone));
                }).toList(),
                onChanged: (val) => setState(() => _selectedZone = val),
                validator: (val) => val == null ? 'Please select zone' : null,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _daysController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: 'Days Since Last Check',
                  border: OutlineInputBorder(),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Required' : null,
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: TextFormField(
                      controller: _latController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(
                        labelText: 'Latitude',
                        border: OutlineInputBorder(),
                      ),
                      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextFormField(
                      controller: _longController,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(
                        labelText: 'Longitude',
                        border: OutlineInputBorder(),
                      ),
                      validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _descController,
                maxLines: 3,
                decoration: const InputDecoration(
                  labelText: 'Hazard Observation & Description',
                  border: OutlineInputBorder(),
                ),
                validator: (val) => val == null || val.isEmpty ? 'Please enter description' : null,
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  backgroundColor: Colors.blueGrey[800],
                  foregroundColor: Colors.white,
                ),
                onPressed: _isSubmitting ? null : _submitInspection,
                child: _isSubmitting
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('SUBMIT INSPECTION', style: TextStyle(fontSize: 16)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
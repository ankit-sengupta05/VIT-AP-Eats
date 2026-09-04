import 'package:flutter/material.dart';

import '../../theme.dart';
import '../../models/restaurant.dart';
import '../../services/restaurants_service.dart';

class RestaurantForm extends StatefulWidget {
  final Restaurant? existingRestaurant;
  const RestaurantForm({super.key, this.existingRestaurant});

  @override
  State<RestaurantForm> createState() => _RestaurantFormState();
}

class _RestaurantFormState extends State<RestaurantForm> {
  final _formKey     = GlobalKey<FormState>();
  final _nameCtrl    = TextEditingController();
  final _slugCtrl    = TextEditingController();
  final _cuisineCtrl = TextEditingController();
  final _ratingCtrl  = TextEditingController();
  final _timeCtrl    = TextEditingController();
  final _feeCtrl     = TextEditingController();
  final _imgCtrl     = TextEditingController();

  bool _isOpen = true;
  bool _isVeg  = false;
  bool _saving = false;

  final RestaurantsService _service = RestaurantsService();
  bool get _isEditing => widget.existingRestaurant != null;

  @override
  void initState() {
    super.initState();
    if (_isEditing) {
      final r = widget.existingRestaurant!;
      _nameCtrl.text    = r.name;
      _slugCtrl.text    = r.slug;
      _cuisineCtrl.text = r.cuisine;
      _ratingCtrl.text  = r.rating.toStringAsFixed(1);
      _timeCtrl.text    = r.deliveryTime.toString();
      _feeCtrl.text     = r.deliveryFee.toStringAsFixed(0);
      _imgCtrl.text     = r.imageUrl;
      _isOpen           = r.isOpen;
      _isVeg            = r.isVeg;
    }
  }

  @override
  void dispose() {
    for (final c in [
      _nameCtrl, _slugCtrl, _cuisineCtrl, _ratingCtrl,
      _timeCtrl, _feeCtrl, _imgCtrl,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    final data = <String, dynamic>{
      'name':         _nameCtrl.text.trim(),
      'slug':         _slugCtrl.text.trim().toLowerCase().replaceAll(' ', '-'),
      'cuisine':      _cuisineCtrl.text.trim(),
      'rating':       double.tryParse(_ratingCtrl.text.trim()) ?? 0.0,
      'reviewCount':  _isEditing ? widget.existingRestaurant!.reviewCount : 0,
      'deliveryTime': int.tryParse(_timeCtrl.text.trim()) ?? 30,
      'deliveryFee':  double.tryParse(_feeCtrl.text.trim()) ?? 0.0,
      'imageUrl':     _imgCtrl.text.trim(),
      'isOpen':       _isOpen,
      'isVeg':        _isVeg,
      'partnerId':    _isEditing ? widget.existingRestaurant!.partnerId : '',
    };

    try {
      if (_isEditing) {
        await _service.updateRestaurant(widget.existingRestaurant!.id, data);
      } else {
        await _service.addRestaurant(data);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isEditing ? 'Restaurant updated!' : 'Restaurant added!'),
            backgroundColor: AppTheme.statusDelivered,
          ),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'),
              backgroundColor: AppTheme.statusCancelled),
        );
      }
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: Text(_isEditing ? 'Edit Restaurant' : 'Add Restaurant'),
        backgroundColor: AppTheme.surface,
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: Text(
              'Save',
              style: TextStyle(
                color: _saving ? AppTheme.textMuted : AppTheme.primary,
                fontWeight: FontWeight.w700, fontSize: 15,
              ),
            ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _field(_nameCtrl,    'Restaurant Name', required: true),
            const SizedBox(height: 12),
            _field(_slugCtrl,    'Slug (URL ID)',   required: true,
                hint: 'e.g. campus-cafe'),
            const SizedBox(height: 12),
            _field(_cuisineCtrl, 'Cuisine Type',    required: true,
                hint: 'e.g. North Indian, Fast Food'),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _field(_ratingCtrl, 'Rating (0–5)',
                      keyboardType: const TextInputType.numberWithOptions(decimal: true)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _field(_timeCtrl, 'Delivery Time (min)',
                      keyboardType: TextInputType.number),
                ),
              ],
            ),
            const SizedBox(height: 12),
            _field(_feeCtrl, 'Delivery Fee (₹)',
                keyboardType: const TextInputType.numberWithOptions(decimal: true)),
            const SizedBox(height: 12),
            _field(_imgCtrl, 'Image URL', hint: 'https://…'),
            const SizedBox(height: 20),
            _toggle('Currently Open',     _isOpen,  AppTheme.statusDelivered,
                (v) => setState(() => _isOpen = v)),
            _toggle('Pure Veg Restaurant', _isVeg,  AppTheme.statusDelivered,
                (v) => setState(() => _isVeg = v)),
            const SizedBox(height: 32),
            SizedBox(
              height: 52,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                child: Text(
                  _isEditing ? 'Update Restaurant' : 'Add Restaurant',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _field(
    TextEditingController ctrl,
    String label, {
    bool required = false,
    TextInputType keyboardType = TextInputType.text,
    String? hint,
  }) {
    return TextFormField(
      controller: ctrl,
      keyboardType: keyboardType,
      style: const TextStyle(color: AppTheme.textPrimary),
      decoration: InputDecoration(labelText: label, hintText: hint),
      validator: required
          ? (v) => (v == null || v.trim().isEmpty) ? '$label is required' : null
          : null,
    );
  }

  Widget _toggle(String label, bool value, Color color, ValueChanged<bool> onChanged) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      decoration: BoxDecoration(
        color: AppTheme.cardColor,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.cardBorder),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: const TextStyle(color: AppTheme.textPrimary, fontSize: 14)),
          Switch(value: value, onChanged: onChanged, activeColor: color),
        ],
      ),
    );
  }
}

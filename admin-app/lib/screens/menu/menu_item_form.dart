import 'package:flutter/material.dart';

import '../../theme.dart';
import '../../models/menu_item.dart';
import '../../services/menu_service.dart';

class MenuItemForm extends StatefulWidget {
  final String restaurantId;
  final MenuItem? existingItem;

  const MenuItemForm({
    super.key,
    required this.restaurantId,
    this.existingItem,
  });

  @override
  State<MenuItemForm> createState() => _MenuItemFormState();
}

class _MenuItemFormState extends State<MenuItemForm> {
  final _formKey    = GlobalKey<FormState>();
  final _nameCtrl   = TextEditingController();
  final _descCtrl   = TextEditingController();
  final _priceCtrl  = TextEditingController();
  final _catCtrl    = TextEditingController();
  final _imgCtrl    = TextEditingController();

  bool _isVeg       = true;
  bool _isAvailable = true;
  bool _saving      = false;

  final MenuService _service = MenuService();

  bool get _isEditing => widget.existingItem != null;

  @override
  void initState() {
    super.initState();
    if (_isEditing) {
      final item = widget.existingItem!;
      _nameCtrl.text  = item.name;
      _descCtrl.text  = item.description;
      _priceCtrl.text = item.price.toStringAsFixed(0);
      _catCtrl.text   = item.category;
      _imgCtrl.text   = item.imageUrl;
      _isVeg          = item.isVeg;
      _isAvailable    = item.isAvailable;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose(); _descCtrl.dispose(); _priceCtrl.dispose();
    _catCtrl.dispose();  _imgCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    final data = {
      'restaurantId': widget.restaurantId,
      'name':         _nameCtrl.text.trim(),
      'description':  _descCtrl.text.trim(),
      'price':        double.tryParse(_priceCtrl.text.trim()) ?? 0.0,
      'category':     _catCtrl.text.trim().toLowerCase(),
      'imageUrl':     _imgCtrl.text.trim(),
      'isVeg':        _isVeg,
      'isAvailable':  _isAvailable,
    };

    try {
      if (_isEditing) {
        await _service.updateMenuItem(widget.existingItem!.id, data);
      } else {
        await _service.addMenuItem(data);
      }
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(_isEditing ? 'Item updated!' : 'Item added!'),
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
        title: Text(_isEditing ? 'Edit Menu Item' : 'Add Menu Item'),
        backgroundColor: AppTheme.surface,
        actions: [
          TextButton(
            onPressed: _saving ? null : _save,
            child: _saving
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation(AppTheme.primary),
                    ),
                  )
                : const Text(
                    'Save',
                    style: TextStyle(
                      color: AppTheme.primary,
                      fontWeight: FontWeight.w700,
                      fontSize: 15,
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
            _buildField(_nameCtrl,  'Item Name',    required: true),
            const SizedBox(height: 12),
            _buildField(_descCtrl,  'Description',  maxLines: 3),
            const SizedBox(height: 12),
            _buildField(_priceCtrl, 'Price (₹)',    required: true,
                keyboardType: const TextInputType.numberWithOptions(decimal: true)),
            const SizedBox(height: 12),
            _buildField(_catCtrl,   'Category',     required: true,
                hint: 'e.g. main course, beverages'),
            const SizedBox(height: 12),
            _buildField(_imgCtrl,   'Image URL',    hint: 'https://…'),
            const SizedBox(height: 20),

            // ── Toggles ──────────────────────────────────────────────────
            _ToggleRow(
              label: 'Vegetarian',
              value: _isVeg,
              activeColor: AppTheme.statusDelivered,
              onChanged: (v) => setState(() => _isVeg = v),
            ),
            _ToggleRow(
              label: 'Available for Order',
              value: _isAvailable,
              activeColor: AppTheme.primary,
              onChanged: (v) => setState(() => _isAvailable = v),
            ),
            const SizedBox(height: 32),

            SizedBox(
              height: 52,
              child: ElevatedButton(
                onPressed: _saving ? null : _save,
                child: Text(
                  _isEditing ? 'Update Item' : 'Add Item',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField(
    TextEditingController ctrl,
    String label, {
    bool required = false,
    int maxLines = 1,
    TextInputType keyboardType = TextInputType.text,
    String? hint,
  }) {
    return TextFormField(
      controller: ctrl,
      maxLines: maxLines,
      keyboardType: keyboardType,
      style: const TextStyle(color: AppTheme.textPrimary),
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
      ),
      validator: required
          ? (v) => (v == null || v.trim().isEmpty) ? '$label is required' : null
          : null,
    );
  }
}

class _ToggleRow extends StatelessWidget {
  final String label;
  final bool value;
  final Color activeColor;
  final ValueChanged<bool> onChanged;

  const _ToggleRow({
    required this.label,
    required this.value,
    required this.activeColor,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
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
          Switch(
            value: value,
            onChanged: onChanged,
            activeColor: activeColor,
          ),
        ],
      ),
    );
  }
}

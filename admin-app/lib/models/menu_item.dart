import 'package:cloud_firestore/cloud_firestore.dart';

class MenuItemVariant {
  final String label;
  final double price;

  const MenuItemVariant({required this.label, required this.price});

  factory MenuItemVariant.fromMap(Map<String, dynamic> m) => MenuItemVariant(
        label: m['label'] as String? ?? '',
        price: (m['price'] as num?)?.toDouble() ?? 0.0,
      );

  Map<String, dynamic> toMap() => {'label': label, 'price': price};
}

class MenuItem {
  final String id;
  final String restaurantId;
  final String name;
  final String description;
  final double price;
  final String category;
  final String imageUrl;
  final bool isAvailable;
  final bool isVeg;
  final List<MenuItemVariant>? variants;

  const MenuItem({
    required this.id,
    required this.restaurantId,
    required this.name,
    required this.description,
    required this.price,
    required this.category,
    required this.imageUrl,
    required this.isAvailable,
    required this.isVeg,
    this.variants,
  });

  factory MenuItem.fromDoc(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    final rawVariants = d['variants'] as List<dynamic>?;
    return MenuItem(
      id:           doc.id,
      restaurantId: d['restaurantId'] as String? ?? '',
      name:         d['name']         as String? ?? '',
      description:  d['description']  as String? ?? '',
      price:        (d['price']       as num?)?.toDouble() ?? 0.0,
      category:     d['category']     as String? ?? '',
      imageUrl:     d['imageUrl']     as String? ?? '',
      isAvailable:  d['isAvailable']  as bool?   ?? true,
      isVeg:        d['isVeg']        as bool?   ?? false,
      variants:     rawVariants?.map(
        (v) => MenuItemVariant.fromMap(Map<String, dynamic>.from(v as Map)),
      ).toList(),
    );
  }

  Map<String, dynamic> toMap() {
    final map = <String, dynamic>{
      'restaurantId': restaurantId,
      'name':         name,
      'description':  description,
      'price':        price,
      'category':     category,
      'imageUrl':     imageUrl,
      'isAvailable':  isAvailable,
      'isVeg':        isVeg,
    };
    if (variants != null && variants!.isNotEmpty) {
      map['variants'] = variants!.map((v) => v.toMap()).toList();
    }
    return map;
  }

  MenuItem copyWith({
    String? restaurantId, String? name, String? description, double? price,
    String? category, String? imageUrl, bool? isAvailable, bool? isVeg,
    List<MenuItemVariant>? variants,
  }) => MenuItem(
    id:           id,
    restaurantId: restaurantId ?? this.restaurantId,
    name:         name         ?? this.name,
    description:  description  ?? this.description,
    price:        price        ?? this.price,
    category:     category     ?? this.category,
    imageUrl:     imageUrl     ?? this.imageUrl,
    isAvailable:  isAvailable  ?? this.isAvailable,
    isVeg:        isVeg        ?? this.isVeg,
    variants:     variants     ?? this.variants,
  );
}

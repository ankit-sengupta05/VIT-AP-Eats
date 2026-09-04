import 'package:cloud_firestore/cloud_firestore.dart';

class Restaurant {
  final String id;
  final String name;
  final String slug;
  final String cuisine;
  final double rating;
  final int reviewCount;
  final int deliveryTime; // minutes
  final double deliveryFee;
  final String imageUrl;
  final bool isOpen;
  final bool isVeg;
  final String partnerId;

  const Restaurant({
    required this.id,
    required this.name,
    required this.slug,
    required this.cuisine,
    required this.rating,
    required this.reviewCount,
    required this.deliveryTime,
    required this.deliveryFee,
    required this.imageUrl,
    required this.isOpen,
    required this.isVeg,
    required this.partnerId,
  });

  factory Restaurant.fromDoc(DocumentSnapshot doc) {
    final d = doc.data() as Map<String, dynamic>;
    return Restaurant(
      id:           doc.id,
      name:         d['name']         as String? ?? '',
      slug:         d['slug']         as String? ?? '',
      cuisine:      d['cuisine']      as String? ?? '',
      rating:       (d['rating']      as num?)?.toDouble() ?? 0.0,
      reviewCount:  (d['reviewCount'] as num?)?.toInt()    ?? 0,
      deliveryTime: (d['deliveryTime'] as num?)?.toInt()   ?? 30,
      deliveryFee:  (d['deliveryFee'] as num?)?.toDouble() ?? 0.0,
      imageUrl:     d['imageUrl']     as String? ?? '',
      isOpen:       d['isOpen']       as bool?   ?? false,
      isVeg:        d['isVeg']        as bool?   ?? false,
      partnerId:    d['partnerId']    as String? ?? '',
    );
  }

  Map<String, dynamic> toMap() => {
    'name':         name,
    'slug':         slug,
    'cuisine':      cuisine,
    'rating':       rating,
    'reviewCount':  reviewCount,
    'deliveryTime': deliveryTime,
    'deliveryFee':  deliveryFee,
    'imageUrl':     imageUrl,
    'isOpen':       isOpen,
    'isVeg':        isVeg,
    'partnerId':    partnerId,
  };

  Restaurant copyWith({
    String? name, String? slug, String? cuisine, double? rating,
    int? reviewCount, int? deliveryTime, double? deliveryFee,
    String? imageUrl, bool? isOpen, bool? isVeg, String? partnerId,
  }) => Restaurant(
    id: id,
    name:         name         ?? this.name,
    slug:         slug         ?? this.slug,
    cuisine:      cuisine      ?? this.cuisine,
    rating:       rating       ?? this.rating,
    reviewCount:  reviewCount  ?? this.reviewCount,
    deliveryTime: deliveryTime ?? this.deliveryTime,
    deliveryFee:  deliveryFee  ?? this.deliveryFee,
    imageUrl:     imageUrl     ?? this.imageUrl,
    isOpen:       isOpen       ?? this.isOpen,
    isVeg:        isVeg        ?? this.isVeg,
    partnerId:    partnerId    ?? this.partnerId,
  );
}

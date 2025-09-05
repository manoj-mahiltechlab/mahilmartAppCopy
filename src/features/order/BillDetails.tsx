import {View, StyleSheet} from 'react-native';
import React, {FC} from 'react';
import {Colors, Fonts} from '@utils/Constants';
import CustomText from '@components/ui/CustomText';
import {RFValue} from 'react-native-responsive-fontsize';

const ReportItem: FC<{
  title: string;
  price: number;
  highlightColor?: string;
}> = ({title, price, highlightColor}) => {
  return (
    <View style={styles.flexRowBetween}>
      {/* Title */}
      <CustomText variant="h8" style={styles.itemText}>
        {title}
      </CustomText>

      {/* Amount with conditional highlight */}
      <CustomText
        variant="h8"
        style={[
          styles.itemText,
          highlightColor && {color: highlightColor, fontFamily: Fonts.SemiBold},
        ]}>
        {price === 0 && title.toLowerCase().includes('delivery')
          ? 'FREE'
          : `₹${price}`}
      </CustomText>
    </View>
  );
};

const BillDetails: FC<{totalItemPrice: number}> = ({totalItemPrice}) => {
  // ✅ Delivery charge condition
  const deliveryCharge = totalItemPrice >= 500 ? 0 : 40;
  const grandTotal = totalItemPrice + deliveryCharge;

  return (
    <View style={styles.container}>
      {/* Title */}
      <CustomText style={styles.header} fontFamily={Fonts.SemiBold}>
        Price Details
      </CustomText>

      {/* Bill Items */}
      <View style={styles.billContainer}>
        <ReportItem
          title="Price (Items)"
          price={totalItemPrice}
          highlightColor="blue" // ✅ Highlight in blue
        />

        <ReportItem
          title="Delivery Charges"
          price={deliveryCharge}
          highlightColor={deliveryCharge === 0 ? 'green' : 'red'} // ✅ Green or Red
        />

        <ReportItem title="Handling Charges" price={0} />
        <ReportItem title="Surge Charges" price={0} />
      </View>

      {/* Grand Total */}
      <View style={styles.grandTotalRow}>
        <CustomText variant="h6" fontFamily={Fonts.SemiBold}>
          Grand Total
        </CustomText>
        <CustomText
          variant="h6"
          fontFamily={Fonts.SemiBold}
          style={{color: Colors.text}}>
          ₹{grandTotal}
        </CustomText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginVertical: 10,
    padding: 14,
    borderWidth: 0.7,
    borderColor: Colors.border,
  },
  header: {
    fontSize: RFValue(14),
    marginBottom: 12,
    color: '#333',
  },
  billContainer: {
    borderBottomWidth: 0.7,
    borderColor: Colors.border,
    paddingBottom: 10,
    marginBottom: 10,
  },
  flexRowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 6,
  },
  itemText: {
    color: '#444',
  },
  grandTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
});

export default BillDetails;
